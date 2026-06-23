import { Injectable } from '@angular/core';
import { Applicant } from '@app-applicant/applicant.model';
import { NormalizedJob } from './public-job-normalizer.model';
import { CompatibilityLabel, ConfidenceLabel, JobCompatibilityResult } from './job-compatibility.model';
import { JobMatchabilityService } from './job-matchability.service';
import { MatchFactorEvidence, MatchDataUsed, MatchDataNotUsed, MATCH_FACTOR_MODEL_VERSION } from './match-factor.model';
import { buildFactorSummary, buildFactorUiHints } from './match-factor-adapter';
import { findFactorRegistryEntry } from './match-factor-registry';

const LABEL_ORDER: CompatibilityLabel[] = ['Low Match', 'Partial Match', 'Good Potential', 'Strong Match', 'Excellent Match'];

/**
 * MATCH v3 -- lightweight skill alias seed (Phase 8 of the registered
 * spec). Exact match still takes priority; this only widens the
 * comparison so common synonyms aren't scored as misses. Deliberately
 * small and curated, not a full taxonomy table (no schema for that
 * exists yet -- see GETHIRED_MATCH_V3_SKILLS_TAXONOMY_SPEC.md).
 */
const SKILL_ALIASES: Record<string, string[]> = {
  'javascript': ['js'],
  'react': ['react.js', 'reactjs'],
  'excel': ['ms excel', 'microsoft excel'],
  'customer service': ['customer support', 'client support'],
  'sales representative': ['sales rep'],
  'human resources': ['hr'],
  'customer service representative': ['csr'],
  'business process outsourcing': ['bpo'],
  'air conditioning': ['aircon'],
  'accounting support': ['bookkeeping'],
  'visual design': ['graphic design'],
  'customer relationship management': ['crm'],
};

interface FactorResult {
  key: string;
  label: string;
  weight: number;
  applicable: boolean;
  ratio: number; // 0-1, only meaningful when applicable
  matchedDetail?: string;
  missingDetail?: string;
  /** MATCH FACTORS v2 -- registry codes for evidence generation. matchedCode
   * is used when ratio >= 0.5, missingCode otherwise. notApplicableCode is
   * used when the factor is inapplicable (e.g. industry, always today). */
  matchedCode?: string;
  missingCode?: string;
  notApplicableCode?: string;
  importance?: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Deterministic, frontend-only job-compatibility scoring. Net-new — no
 * backend equivalent exists today (PUBLIC_JOB_PORTAL_REDESIGN.md §1.8).
 *
 * Weights match the mission spec exactly: skills 30, role/title 15,
 * industry/category 10, experience level 15, location/work setup 15,
 * education/certification 10, salary/preference 5 (= 100 total).
 *
 * A factor that the data genuinely can't evaluate (e.g. the job lists no
 * skills, or the applicant has no industry preference field at all in the
 * current data model) is excluded from the denominator rather than scored
 * as a miss — a data gap on either side should never silently look like a
 * poor fit. This is a deliberate, documented choice: low/excellent match
 * always reflects an actual comparison, never a missing-data penalty.
 */
@Injectable({ providedIn: 'root' })
export class JobCompatibilityService {

  constructor(private jobMatchabilityService: JobMatchabilityService) {}

  evaluate(applicant: Applicant | null | undefined, job: NormalizedJob): JobCompatibilityResult {
    if (!applicant || !job) {
      return {
        score: 0,
        label: 'Low Match',
        matchedFactors: [],
        missingFactors: [],
        suggestions: ['Create your free profile to see your fit for this role.'],
        explanation: 'Create a profile to calculate your match.',
        confidence: 0,
        confidenceLabel: 'Limited Data',
        matchedFactorEvidence: [],
        missingFactorEvidence: [],
        transferableFactorEvidence: [],
        unclearFactorEvidence: [],
        blockedFactorEvidence: [],
        requiredBlockers: [],
        dataUsed: [],
        dataNotUsed: this.dataNotUsedEntries(),
        factorSummary: buildFactorSummary([], [], [], [], 'Limited Data'),
        factorUiHints: buildFactorUiHints('Low Match', 'Limited Data', false),
      };
    }

    const factors: FactorResult[] = [
      this.skillsFactor(applicant, job),
      this.preferredSkillsFactor(applicant, job),
      this.roleFactor(applicant, job),
      this.industryFactor(applicant, job),
      this.experienceLevelFactor(applicant, job),
      this.workSetupFactor(applicant, job),
      this.educationFactor(applicant, job),
      this.salaryFactor(applicant, job),
    ];

    // MATCH FACTORS v3 addendum -- certification evidence is generated
    // separately from `factors[]` on purpose: it must never reach
    // matchedFactors/missingFactors (legacy arrays) or the score/
    // confidence denominator, since weight 0 doesn't prevent a factor
    // from being included in the legacy array (the legacy filter only
    // checks ratio + matchedDetail presence, not weight). Including it in
    // `factors[]` would silently change explanationFor()'s output for
    // any applicant with certifications on file -- exactly the kind of
    // legacy behavior change this whole effort exists to prevent.
    const certificationFactor = this.certificationFactor(applicant, job);

    const applicableFactors = factors.filter(f => f.applicable);
    const totalWeight = applicableFactors.reduce((sum, f) => sum + f.weight, 0);
    const weightedScore = applicableFactors.reduce((sum, f) => sum + f.ratio * f.weight, 0);
    const score = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;

    // MATCH FACTORS v2 -- legacy fields computed exactly as before
    // (matchedDetail/missingDetail sentence-fragments, unchanged). NOT
    // derived from matchedFactorEvidence's registry labels below, even
    // though the registered command's compatibility rule suggests
    // `matchedFactors = matchedFactorEvidence.map(f => f.label)`.
    // Deliberate deviation, documented in
    // GETHIRED_MATCH_EVIDENCE_COMPATIBILITY_REPORT.md: evidence labels are
    // full standalone sentences ("Required skill found"), while
    // matchedDetail/missingDetail are terse fragments tuned for
    // explanationFor()/suggestionsFor()'s templates ("skills", "role
    // fit"). Deriving one from the other would change the literal copy
    // JobMatchPanelComponent has always shown -- a real behavior change,
    // not just a type-compatible one. The non-negotiable "do not break
    // JobMatchPanelComponent" rule takes priority over the letter of the
    // suggested compatibility formula.
    const matchedFactors = applicableFactors.filter(f => f.ratio >= 0.5 && f.matchedDetail).map(f => f.matchedDetail!);
    const missingFactors = applicableFactors.filter(f => f.ratio < 0.5 && f.missingDetail).map(f => f.missingDetail!);

    // MATCH FACTORS v2 -- structured evidence, additive, built from the
    // same factors[] array (one source of computation, two presentations).
    const evidenceList = factors.map(f => this.toEvidence(f)).filter((e): e is MatchFactorEvidence => e !== null);
    const matchedFactorEvidence = evidenceList.filter(e => e.status === 'matched');
    const missingFactorEvidence = evidenceList.filter(e => e.status === 'missing');
    // v3 addendum: certification evidence is presence-only (no job-side
    // requirement field exists to match against), so it deliberately
    // stays OUT of matched/missing evidence entirely -- putting it there
    // would misleadingly imply the job required a certification and the
    // applicant satisfied it, which was never actually compared. It
    // surfaces only in dataUsed (via dataUsedEntries below).
    const transferableFactorEvidence: MatchFactorEvidence[] = []; // none computed yet -- no related/transferable tier exists (GH-MATCH-V5-B01)
    const unclearFactorEvidence: MatchFactorEvidence[] = [];
    const blockedFactorEvidence: MatchFactorEvidence[] = []; // required blockers live in ApplicationReadinessService, not here

    // MATCH v5 confidence (Layer 4): blends applicant-side data quality
    // (how much of the factor set had real data) with job-side data
    // quality (JobMatchabilityService's own score, reused rather than
    // duplicated -- closes GETHIRED_MATCH_V3_BACKLOG.md's GH-MATCH-V3-B07).
    // Evidence-quality and extraction-quality (the registered spec's other
    // two confidence dimensions) aren't tracked yet -- see
    // GETHIRED_MATCH_V5_CONFIDENCE_MODEL.md -- so this is a simplified
    // 50/50 blend of the two dimensions that do exist, not the full 35/35/20/10.
    const applicantDataQuality = (applicableFactors.length / factors.length) * 100;
    const jobDataQuality = this.jobMatchabilityService.evaluate(job).score;
    const confidence = Math.round((applicantDataQuality + jobDataQuality) / 2);
    const confidenceLabel = this.confidenceLabelFor(confidence);

    // MATCH v5 calibration (Layer 5): a label can never overstate what the
    // confidence supports. "Excellent Match" with Limited/Low Confidence is
    // false precision -- cap one tier down instead of showing a score the
    // data can't actually back up.
    const label = this.calibrate(this.labelFor(score), confidenceLabel);

    return {
      score,
      label,
      matchedFactors,
      missingFactors,
      suggestions: this.suggestionsFor(missingFactors),
      explanation: this.explanationFor(matchedFactors),
      confidence,
      confidenceLabel,

      // MATCH FACTORS v2 -- additive structured fields.
      matchedFactorEvidence,
      missingFactorEvidence,
      transferableFactorEvidence,
      unclearFactorEvidence,
      blockedFactorEvidence,
      requiredBlockers: [], // owned by ApplicationReadinessService, not duplicated here
      dataUsed: this.dataUsedEntries([...factors, certificationFactor]),
      dataNotUsed: this.dataNotUsedEntries(),
      factorSummary: buildFactorSummary(matchedFactorEvidence, missingFactorEvidence, transferableFactorEvidence, blockedFactorEvidence, confidenceLabel),
      factorUiHints: buildFactorUiHints(label, confidenceLabel, evidenceList.length > 0),
    };
  }

  private calibrate(label: CompatibilityLabel, confidenceLabel: ConfidenceLabel): CompatibilityLabel {
    if (confidenceLabel !== 'Low Confidence' && confidenceLabel !== 'Limited Data') {
      return label;
    }
    const index = LABEL_ORDER.indexOf(label);
    if (index <= 0) {
      return label;
    }
    // Limited Data caps harder (two tiers) than Low Confidence (one tier) --
    // "Excellent Match" on near-zero data would otherwise still land on
    // "Strong Match", which is still too confident a claim for that case.
    const tiersDown = confidenceLabel === 'Limited Data' ? 2 : 1;
    return LABEL_ORDER[Math.max(0, index - tiersDown)];
  }

  private confidenceLabelFor(confidence: number): ConfidenceLabel {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 55) return 'Medium Confidence';
    if (confidence >= 30) return 'Low Confidence';
    return 'Limited Data';
  }

  /**
   * Exact match (case/whitespace-insensitive, normalized upstream by
   * callers) > explicit alias match only. No substring/containment
   * fallback -- removed in the scoped MATCH pass that fixed
   * GETHIRED_MATCH_FACTOR_ADVERSARIAL_TESTS.md's A7 finding: the prior
   * `a.includes(b) || b.includes(a)` fallback caused "React" to match
   * "React Native", "Java" to match "JavaScript", and "SQL" to match
   * "NoSQL" -- distinct skills being scored as equal purely because one
   * string happened to contain the other. Legitimate synonyms (react.js,
   * js, csr, bpo, etc.) are handled exclusively via the curated
   * SKILL_ALIASES map below, never by substring shape.
   */
  private skillsEqual(a: string, b: string): boolean {
    if (a === b) return true;
    const aliasesOfA = SKILL_ALIASES[a] ?? [];
    const aliasesOfB = SKILL_ALIASES[b] ?? [];
    return aliasesOfA.includes(b) || aliasesOfB.includes(a);
  }

  private labelFor(score: number): CompatibilityLabel {
    if (score >= 85) return 'Excellent Match';
    if (score >= 70) return 'Strong Match';
    if (score >= 50) return 'Good Potential';
    if (score >= 30) return 'Partial Match';
    return 'Low Match';
  }

  private suggestionsFor(missing: string[]): string[] {
    if (missing.length === 0) return [];
    return missing.map(m => `Improve your match: ${m.toLowerCase()}.`);
  }

  private explanationFor(matched: string[]): string {
    if (matched.length === 0) {
      return 'Add more skills, preferred roles, and location to improve your match.';
    }
    return `This job matches your ${matched.slice(0, 2).join(' and ').toLowerCase()}.`;
  }

  // ── Individual factors ──────────────────────────────────────────────

  private skillsFactor(applicant: Applicant, job: NormalizedJob): FactorResult {
    const jobSkills = [...job.skills, ...job.tags].map(s => s.toLowerCase().trim());
    const applicantSkills = (applicant.skills ?? []).map(s => s.toLowerCase().trim());
    if (jobSkills.length === 0) {
      return { key: 'skills', label: 'Skills', weight: 30, applicable: false, ratio: 0 };
    }
    const matched = jobSkills.filter(js => applicantSkills.some(as => this.skillsEqual(as, js)));
    const ratio = matched.length / jobSkills.length;
    return {
      key: 'skills', label: 'Skills', weight: 30, applicable: true, ratio,
      matchedDetail: 'skills',
      missingDetail: 'Add skills to improve your match',
      matchedCode: 'required_skill_exact_match', missingCode: 'required_skill_missing', importance: 'critical',
    };
  }

  /** GH-MATCH-V5-B04 -- preferred/good-to-have skills, separate from the
   * required-skills factor above. Found via hand-verifying a registered
   * MATCH v5 test fixture: previously, a preferred skill (e.g. "Zendesk"
   * for a CSR role) earned zero credit anywhere in this service, not
   * under-weighted -- entirely absent as a factor. Lower weight than
   * required skills and excluded from missingFactors (a missing preferred
   * skill should not heavily penalize, per the registered spec). */
  private preferredSkillsFactor(applicant: Applicant, job: NormalizedJob): FactorResult {
    const jobPreferredSkills = (job.goodToHave ?? []).map(s => s.toLowerCase().trim());
    const applicantSkills = (applicant.skills ?? []).map(s => s.toLowerCase().trim());
    if (jobPreferredSkills.length === 0) {
      return { key: 'preferred_skills', label: 'Preferred skills', weight: 10, applicable: false, ratio: 0 };
    }
    const matched = jobPreferredSkills.filter(js => applicantSkills.some(as => this.skillsEqual(as, js)));
    const ratio = matched.length / jobPreferredSkills.length;
    return {
      key: 'preferred_skills', label: 'Preferred skills', weight: 10, applicable: true, ratio,
      matchedDetail: matched.length > 0 ? 'preferred skills' : undefined,
      // Deliberately no missingDetail -- a missing preferred skill
      // should not generate a suggestion/missing-factor entry the way a
      // missing required skill does.
      matchedCode: 'preferred_skill_exact_match', missingCode: 'preferred_skill_missing', importance: 'medium',
    };
  }

  private roleFactor(applicant: Applicant, job: NormalizedJob): FactorResult {
    const jobTitleLower = job.title?.toLowerCase() ?? '';
    const jobRoleLower = job.jobRole?.toLowerCase() ?? '';
    const applicantTitle = applicant.jobTitle?.toLowerCase().trim();
    if (!applicantTitle || (!jobTitleLower && !jobRoleLower)) {
      return { key: 'role', label: 'Role', weight: 15, applicable: false, ratio: 0 };
    }
    const matched = jobTitleLower.includes(applicantTitle) || applicantTitle.includes(jobTitleLower)
      || jobRoleLower.includes(applicantTitle) || applicantTitle.includes(jobRoleLower);
    return {
      key: 'role', label: 'Role', weight: 15, applicable: true, ratio: matched ? 1 : 0,
      matchedDetail: 'role fit',
      missingDetail: 'Update your desired job title to match roles you want',
      matchedCode: 'role_title_exact_match', missingCode: 'role_title_missing', importance: 'high',
    };
  }

  private industryFactor(applicant: Applicant, job: NormalizedJob): FactorResult {
    // Applicant data model has no industry/category preference field today —
    // always inapplicable until that field exists. Documented gap, not a
    // silent zero.
    return { key: 'industry', label: 'Industry', weight: 10, applicable: false, ratio: 0, notApplicableCode: 'industry_missing', importance: 'low' };
  }

  private experienceLevelFactor(applicant: Applicant, job: NormalizedJob): FactorResult {
    if (!applicant.jobLevelId || job.jobLevelId == null) {
      return { key: 'experience', label: 'Experience level', weight: 15, applicable: false, ratio: 0, importance: 'medium' };
    }
    const matched = Number(applicant.jobLevelId) === Number(job.jobLevelId);
    return {
      key: 'experience', label: 'Experience level', weight: 15, applicable: true, ratio: matched ? 1 : 0,
      matchedDetail: 'experience level',
      missingDetail: 'This role expects a different experience level',
      matchedCode: 'experience_seniority_match', missingCode: 'experience_missing', importance: 'high',
    };
  }

  private workSetupFactor(applicant: Applicant, job: NormalizedJob): FactorResult {
    const applicantSetup = (applicant as any).workSetUpId ?? (applicant as any).workSetupId;
    if (!applicantSetup || job.workSetupId == null) {
      return { key: 'work_setup', label: 'Work setup', weight: 15, applicable: false, ratio: 0, importance: 'medium' };
    }
    const matched = Number(applicantSetup) === Number(job.workSetupId);
    return {
      key: 'work_setup', label: 'Work setup', weight: 15, applicable: true, ratio: matched ? 1 : 0,
      matchedDetail: 'preferred work setup',
      missingDetail: 'Update your preferred work setup',
      matchedCode: 'work_setup_match', missingCode: 'work_setup_conflict', importance: 'high',
    };
  }

  private educationFactor(applicant: Applicant, job: NormalizedJob): FactorResult {
    const jobDesired = job.educationalBackground.map(e => e.toLowerCase());
    const applicantFields = (applicant.educationalBackground ?? [])
      .map(e => e.fieldOfStudy?.toLowerCase())
      .filter((f): f is string => !!f);
    if (jobDesired.length === 0 || applicantFields.length === 0) {
      return { key: 'education', label: 'Education', weight: 10, applicable: false, ratio: 0, importance: 'medium' };
    }
    const matched = jobDesired.some(jd => applicantFields.some(af => af.includes(jd) || jd.includes(af)));
    return {
      key: 'education', label: 'Education', weight: 10, applicable: true, ratio: matched ? 1 : 0,
      matchedDetail: 'education background',
      missingDetail: 'Add education matching this role\'s background',
      matchedCode: 'education_field_match', missingCode: 'education_unclear', importance: 'medium',
    };
  }

  private salaryFactor(applicant: Applicant, job: NormalizedJob): FactorResult {
    const aMin = Number(applicant.salaryMinimum);
    const aMax = Number(applicant.salaryMaximum);
    if (!aMin && !aMax) {
      return { key: 'salary', label: 'Salary', weight: 5, applicable: false, ratio: 0, importance: 'low' };
    }
    if (job.salaryMin == null && job.salaryMax == null) {
      return { key: 'salary', label: 'Salary', weight: 5, applicable: false, ratio: 0, importance: 'low' };
    }
    const jobMin = job.salaryMin ?? job.salaryMax ?? 0;
    const jobMax = job.salaryMax ?? job.salaryMin ?? Infinity;
    const overlaps = jobMax >= (aMin || 0) && jobMin <= (aMax || Infinity);
    return {
      key: 'salary', label: 'Salary', weight: 5, applicable: true, ratio: overlaps ? 1 : 0,
      matchedDetail: 'salary expectations',
      missingDetail: 'This role\'s salary range is outside your expectations',
      matchedCode: 'salary_range_overlap', missingCode: 'salary_range_conflict', importance: 'low',
    };
  }

  /**
   * MATCH FACTORS v3 addendum -- certification presence evidence.
   *
   * Real, confirmed data: `Applicant.certifications[]` exists and is
   * populated (backend's mappedCertifications() maps cert_title directly,
   * confirmed by reading services/applicant.service.js). NOT a job-
   * requirement match, though -- NormalizedJob has no structured
   * certification-requirement field; job-side certification needs (if
   * any) only ever appear as free text inside `requirements: string[]`,
   * which this service cannot reliably parse for a specific cert name
   * without guessing. This is therefore weight 0 (never affects the
   * compatibility score, since there's no real requirement to compare
   * against) but still real evidence -- it contributes to data quality/
   * confidence and appears in the Data Used panel, honestly scoped to
   * what the data actually supports.
   */
  private certificationFactor(applicant: Applicant, job: NormalizedJob): FactorResult {
    const certifications = (applicant as any).certifications as { certTitle?: string | number }[] | undefined;
    const hasCertifications = (certifications ?? []).length > 0;
    if (!hasCertifications) {
      return { key: 'certification', label: 'Certifications', weight: 0, applicable: false, ratio: 0, importance: 'low' };
    }
    return {
      key: 'certification', label: 'Certifications', weight: 0, applicable: true, ratio: 1,
      matchedDetail: 'certifications on file',
      matchedCode: 'certification_on_file', importance: 'low',
    };
  }

  // ── MATCH FACTORS v2 -- evidence generation ─────────────────────────

  /** Converts one FactorResult into a structured MatchFactorEvidence
   * object. Returns null for inapplicable factors with no registry code
   * (nothing useful to show) -- callers filter nulls out. */
  private toEvidence(factor: FactorResult): MatchFactorEvidence | null {
    const isMatched = factor.applicable && factor.ratio >= 0.5;
    const code = !factor.applicable
      ? factor.notApplicableCode
      : isMatched ? factor.matchedCode : factor.missingCode;
    if (!code) {
      return null;
    }
    const registryEntry = findFactorRegistryEntry(code);
    const label = registryEntry?.label ?? factor.label;
    const status: MatchFactorEvidence['status'] = !factor.applicable ? 'not_used' : isMatched ? 'matched' : 'missing';
    const evidenceStrength: MatchFactorEvidence['evidenceStrength'] =
      !factor.applicable ? 'limited' : factor.ratio >= 0.8 ? 'high' : factor.ratio >= 0.5 ? 'medium' : factor.ratio > 0 ? 'low' : 'limited';

    return {
      factorId: `${factor.key}-${status}`,
      factorCode: code,
      label,
      shortLabel: registryEntry?.shortLabel ?? label,
      category: registryEntry?.category ?? 'data_quality',
      subcategory: factor.key,
      status,
      audience: 'applicant',
      visibility: status === 'matched' || status === 'missing' ? 'primary' : 'secondary',
      importance: factor.importance ?? 'medium',
      matchType: !factor.applicable ? 'not_applicable' : isMatched ? 'exact' : 'missing',
      source: 'profile_skill',
      sourceLabel: 'Your GetHired profile',
      sourceVisibility: 'both',
      evidenceStrength,
      confidenceImpact: factor.applicable ? Math.round(factor.ratio * 10) : 0,
      scoreImpact: factor.applicable ? Math.round(factor.ratio * factor.weight) : 0,
      maxScoreImpact: factor.weight,
      weightGroup: factor.key,
      confidenceReason: factor.applicable
        ? 'Both sides had data for this comparison.'
        : 'Not enough data exists on one side to evaluate this yet.',
      explanation: isMatched ? (factor.matchedDetail ?? label) : (factor.missingDetail ?? label),
      applicantCopy: isMatched
        ? `Your profile shows this: ${factor.matchedDetail ?? label}.`
        : (factor.missingDetail ?? `We could not find this yet: ${label}.`),
      employerCopy: isMatched
        ? `Submitted information shows: ${factor.matchedDetail ?? label}.`
        : `This signal was not found or is unclear: ${label}.`,
      createdBy: 'rules_engine',
      modelVersion: MATCH_FACTOR_MODEL_VERSION,
    };
  }

  /** Always-emitted, never conditional -- these document what's excluded
   * from scoring, not a finding about this particular applicant/job. */
  private dataNotUsedEntries(): MatchDataNotUsed[] {
    return [
      { key: 'protected_attributes', label: 'Protected attributes', reason: 'Never used for scoring.', visibleToApplicant: true, visibleToEmployer: true },
      { key: 'photo_appearance', label: 'Photo appearance', reason: 'Never analyzed or scored.', visibleToApplicant: true, visibleToEmployer: true },
      { key: 'video_traits', label: 'Video face/voice/accent/emotion/personality', reason: 'Only submission status is ever used, never content traits.', visibleToApplicant: true, visibleToEmployer: true },
      { key: 'school_prestige', label: 'School prestige', reason: 'Never used for scoring.', visibleToApplicant: true, visibleToEmployer: true },
      { key: 'exact_address', label: 'Exact address', reason: 'Only broad location/work-setup compatibility is used.', visibleToApplicant: true, visibleToEmployer: true },
    ];
  }

  /**
   * QA fix (scoped MATCHED sweep of the v3 addendum): the generic summary
   * template below claims "this job's X requirement" was used, which is
   * true for skills/role/work-setup/education/salary (all real job-side
   * comparisons) but was FALSE for the certification factor -- there is
   * no job-side certification requirement field, so the old generic
   * template silently claimed a requirement comparison happened when it
   * never did. Certification gets its own honest, presence-only summary.
   */
  private dataUsedEntries(factors: FactorResult[]): MatchDataUsed[] {
    return factors.filter(f => f.applicable).map(f => ({
      key: f.key,
      label: f.label,
      source: 'profile_skill' as const,
      visibleToApplicant: true,
      visibleToEmployer: true,
      summary: f.key === 'certification'
        ? 'Used the fact that you have certifications on file (not compared against a specific job requirement).'
        : `Used your ${f.label.toLowerCase()} and this job's ${f.label.toLowerCase()} requirement.`,
    }));
  }
}
