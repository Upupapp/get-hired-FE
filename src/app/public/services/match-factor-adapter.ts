import {
  MatchFactorEvidence,
  MatchFactorSummary,
  MatchFactorUiHints,
  MatchFactorUiHint,
} from './match-factor.model';
import { CompatibilityLabel, ConfidenceLabel, JobCompatibilityResult } from './job-compatibility.model';

/**
 * GetHired MATCH FACTORS v2 -- adapter helpers. Single source of truth
 * for converting between the legacy string[] shape and the new
 * structured evidence shape, so nothing ever computes "what matched"
 * twice in two places that could disagree.
 */

/**
 * General-purpose fallback: derives legacy-shaped arrays from evidence
 * when no legacy computation exists at all (used by
 * ensureMatchEvidenceCompatibility below for future/other consumers that
 * are evidence-first). NOT used by JobCompatibilityService itself, which
 * computes matchedFactors/missingFactors directly from its own
 * factors[] array to avoid changing JobMatchPanelComponent's rendered
 * copy -- see GETHIRED_MATCH_EVIDENCE_COMPATIBILITY_REPORT.md.
 */
export function toLegacyMatchedFactors(evidence: MatchFactorEvidence[]): string[] {
  return (evidence || []).map(f => f.label);
}

export function toLegacyMissingFactors(evidence: MatchFactorEvidence[]): string[] {
  return (evidence || []).map(f => f.label);
}

/**
 * If structured fields are missing but legacy fields exist, UI must
 * still render legacy fields (no change needed -- they're already
 * there). If legacy fields are missing but structured fields exist,
 * this generates them. If both are missing, returns empty arrays --
 * callers render "Detailed evidence unavailable", never crash.
 */
export function ensureMatchEvidenceCompatibility(result: JobCompatibilityResult): JobCompatibilityResult {
  const matchedFactors = result.matchedFactors && result.matchedFactors.length > 0
    ? result.matchedFactors
    : toLegacyMatchedFactors(result.matchedFactorEvidence || []);

  const missingFactors = result.missingFactors && result.missingFactors.length > 0
    ? result.missingFactors
    : toLegacyMissingFactors(result.missingFactorEvidence || []);

  return { ...result, matchedFactors, missingFactors };
}

export function normalizeMatchFactorEvidence(evidence: MatchFactorEvidence[] | undefined | null): MatchFactorEvidence[] {
  return evidence || [];
}

/** Badge styling is derived entirely from status/importance -- centralized
 * here so no component hardcodes its own status->badge mapping. */
export function mapFactorToBadge(factor: MatchFactorEvidence): MatchFactorUiHint {
  if (factor.uiHint) {
    return factor.uiHint;
  }
  const byStatus: Record<string, MatchFactorUiHint['badgeStyle']> = {
    matched: 'strong_signal',
    missing: 'missing_signal',
    transferable: 'transferable_signal',
    unclear: 'limited_data',
    limited_data: 'limited_data',
    blocked: 'required_blocker',
    not_used: 'not_used',
    conflict: 'missing_signal',
  };
  const badgeStyle = byStatus[factor.status] || 'neutral';
  const colorByBadge: Record<string, MatchFactorUiHint['colorToken']> = {
    strong_signal: 'success',
    missing_signal: 'warning',
    transferable_signal: 'info',
    limited_data: 'neutral',
    required_blocker: 'critical',
    not_used: 'neutral',
    neutral: 'neutral',
  };
  return {
    badgeStyle,
    icon: badgeStyle === 'strong_signal' ? 'check' : badgeStyle === 'missing_signal' ? 'alert' : badgeStyle === 'transferable_signal' ? 'bridge' : badgeStyle === 'required_blocker' ? 'shield' : 'info',
    colorToken: colorByBadge[badgeStyle],
    placement: 'job_detail_panel',
    motion: 'chip_reveal',
  };
}

export function mapFactorToApplicantCopy(factor: MatchFactorEvidence): string {
  return factor.applicantCopy || factor.explanation;
}

export function mapFactorToEmployerCopy(factor: MatchFactorEvidence): string {
  return factor.employerCopy || factor.explanation;
}

const LABEL_TIER: Record<CompatibilityLabel, number> = {
  'Low Match': 0, 'Partial Match': 1, 'Good Potential': 2, 'Strong Match': 3, 'Excellent Match': 4,
};

function confidenceExplanationFor(confidenceLabel: ConfidenceLabel): string {
  switch (confidenceLabel) {
    case 'High Confidence': return 'Both the job post and your profile have enough detail for a clear comparison.';
    case 'Medium Confidence': return 'Some details are missing on one side, which limits how clear this comparison can be.';
    case 'Low Confidence': return 'Several details are missing, so treat this result as a starting point, not a final answer.';
    case 'Limited Data': return 'We need more profile, CV, or job-post detail before this comparison can be reliable.';
  }
}

/** Builds the top-level summary consumed by progressive-disclosure UI
 * (job card shows 1 matched + 1 missing; the drawer shows top 3 of each;
 * this function is the one place that decides "top"). */
export function buildFactorSummary(
  matchedEvidence: MatchFactorEvidence[],
  missingEvidence: MatchFactorEvidence[],
  transferableEvidence: MatchFactorEvidence[],
  blockedEvidence: MatchFactorEvidence[],
  confidenceLabel: ConfidenceLabel,
): MatchFactorSummary {
  const byImportance = (a: MatchFactorEvidence, b: MatchFactorEvidence) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.importance] - order[b.importance];
  };
  return {
    topMatched: [...matchedEvidence].sort(byImportance).slice(0, 3).map(f => f.label),
    topMissing: [...missingEvidence].sort(byImportance).slice(0, 3).map(f => f.label),
    topTransferable: [...transferableEvidence].sort(byImportance).slice(0, 3).map(f => f.label),
    topBlockers: blockedEvidence.map(f => f.label),
    confidenceExplanation: confidenceExplanationFor(confidenceLabel),
    applicantSummary: matchedEvidence.length > 0
      ? `This job matches ${matchedEvidence.length} signal${matchedEvidence.length === 1 ? '' : 's'} from your profile.`
      : 'Add more profile details to see how this job matches you.',
    employerSummary: matchedEvidence.length > 0
      ? `Submitted information shows ${matchedEvidence.length} matched signal${matchedEvidence.length === 1 ? '' : 's'}.`
      : 'Limited submitted information is available for this signal comparison.',
  };
}

// ── MATCH FACTORS v3 addendum -- deduplication ──────────────────────────
// Today, JobCompatibilityService produces at most ONE evidence object per
// factor category (e.g. one "skills" evidence entry covering all matched
// skills in aggregate, not one entry per individual skill) -- so there is
// no live duplicate-evidence case to merge yet. These helpers exist so
// that when skill-level (not factor-level) evidence is built in a future
// pass, deduplication is already in place rather than retrofitted.

/** Same logic as JobCompatibilityService's skillsEqual(), generalized
 * into a canonical key so two evidence objects for "JS" and "JavaScript"
 * collapse into one merge group instead of appearing as two chips. */
export function canonicalFactorKey(rawLabel: string, aliases: Record<string, string[]> = {}): string {
  const normalized = rawLabel.toLowerCase().trim();
  for (const [canonical, aliasList] of Object.entries(aliases)) {
    if (canonical === normalized || aliasList.includes(normalized)) {
      return canonical;
    }
  }
  return normalized;
}

/** Groups evidence by canonicalFactorKey so duplicate signals merge into
 * one record instead of one chip per source. */
export function dedupeGroup(evidence: MatchFactorEvidence[], aliases: Record<string, string[]> = {}): Map<string, MatchFactorEvidence[]> {
  const groups = new Map<string, MatchFactorEvidence[]>();
  for (const item of evidence) {
    const key = canonicalFactorKey(item.subcategory || item.label, aliases);
    const existing = groups.get(key) || [];
    existing.push(item);
    groups.set(key, existing);
  }
  return groups;
}

const RELIABILITY_RANK: Record<string, number> = {
  confirmed_multiple_sources: 0, structured_high: 1, document_extracted_medium: 2,
  single_source_medium: 3, inferred_low: 4, unclear_limited: 5,
};

/** Multiple evidence sources for the same canonical factor increase
 * confidence (capped, not summed unboundedly) but must NOT multiply
 * score impact -- one factor, one score contribution, regardless of how
 * many sources confirm it. */
export function mergeEvidenceSources(group: MatchFactorEvidence[]): MatchFactorEvidence {
  if (group.length === 0) {
    throw new Error('mergeEvidenceSources requires at least one evidence item');
  }
  const primary = keepHighestImportance(group);
  const confidenceBoost = group.length > 1 ? Math.min(10, (group.length - 1) * 3) : 0;
  return {
    ...primary,
    confidenceImpact: Math.min(100, primary.confidenceImpact + confidenceBoost),
    scoreImpact: capScoreImpact(primary.scoreImpact, primary.maxScoreImpact),
    relatedSignals: group.filter(g => g.factorId !== primary.factorId).map(g => g.sourceLabel),
  };
}

export function keepHighestImportance(group: MatchFactorEvidence[]): MatchFactorEvidence {
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...group].sort((a, b) => order[a.importance] - order[b.importance])[0];
}

/** Confidence may rise with corroborating sources; this rank table is
 * used by callers who need to pick the strongest reliability among
 * merged sources (e.g. profile + CV both confirming the same skill
 * upgrades reliability to confirmed_multiple_sources). */
export function strongestReliability(reliabilities: string[]): string {
  return [...reliabilities].sort((a, b) => (RELIABILITY_RANK[a] ?? 9) - (RELIABILITY_RANK[b] ?? 9))[0] ?? 'unclear_limited';
}

export function capScoreImpact(scoreImpact: number, maxScoreImpact: number | undefined): number {
  return maxScoreImpact != null ? Math.min(scoreImpact, maxScoreImpact) : scoreImpact;
}

/** v3 addendum audience-transform 3rd tier -- internal/debug copy, never
 * rendered to applicant or employer UI. */
export function mapFactorToInternalCopy(factor: MatchFactorEvidence): string {
  return `${factor.factorCode} -- status: ${factor.status}, importance: ${factor.importance}, source: ${factor.source}, scoreImpact: ${factor.scoreImpact}/${factor.maxScoreImpact ?? 'n/a'}, confidenceImpact: ${factor.confidenceImpact}.`;
}

export function buildFactorUiHints(label: CompatibilityLabel, confidenceLabel: ConfidenceLabel, hasEvidence: boolean): MatchFactorUiHints {
  return {
    primaryBadgeLabel: label,
    primaryBadgeStyle: LABEL_TIER[label] >= 3 ? 'strong_signal' : LABEL_TIER[label] >= 2 ? 'neutral' : 'missing_signal',
    confidenceBadgeLabel: confidenceLabel,
    // Never show a numeric score alongside an overstated label -- mirrors
    // the same calibration discipline already applied to the label itself.
    showNumericScore: confidenceLabel !== 'Limited Data',
    showEvidenceDrawer: hasEvidence,
    showDataUsedPanel: hasEvidence,
  };
}
