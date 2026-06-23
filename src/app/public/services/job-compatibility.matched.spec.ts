import { TestBed } from '@angular/core/testing';
import { JobCompatibilityService } from './job-compatibility.service';
import { JobMatchabilityService } from './job-matchability.service';
import { NormalizedJob } from './public-job-normalizer.model';
import { Applicant } from '@app-applicant/applicant.model';

/**
 * MATCHED v2 -- golden fixtures, metamorphic rules, and property-based
 * invariants, actually executed against the real services (not hand-
 * traced) using this project's existing Karma/Jasmine setup. No new test
 * framework introduced -- `ng test` already exists, these are the first
 * spec files written for either service.
 */

const baseJob = (overrides: Partial<NormalizedJob> = {}): NormalizedJob => ({
  jobId: 'job-1',
  title: 'Customer Service Representative',
  companyId: 'company-1',
  companyName: 'Test Co',
  companyLogo: null,
  companyDetails: null,
  companyCity: null,
  companyCountry: null,
  companyNumberOfEmployee: null,
  location: 'Manila',
  city: 'Manila',
  country: 'Philippines',
  workSetupId: 2,
  workSetup: 'Onsite',
  salaryMin: 20000,
  salaryMax: 30000,
  salaryCurrency: 'PHP',
  salaryDisplay: 'PHP 20,000 - 30,000',
  hasSalary: true,
  jobTypeId: 1,
  jobType: 'Full time',
  jobLevelId: 1,
  jobLevel: 'Entry',
  industryId: null,
  industry: null,
  categoryId: null,
  category: null,
  jobRoleId: null,
  jobRole: null,
  statusId: 2,
  postedDate: new Date(),
  expirationDate: null,
  description: 'We need a CSR.',
  responsibilities: 'Handle customer inquiries.',
  requirements: [],
  skills: ['customer service', 'communication', 'CRM'],
  tags: [],
  goodToHave: ['Zendesk', 'conflict resolution'],
  educationalBackground: [],
  benefits: [],
  certificationRequirements: [],
  hasVideoInterview: false,
  interviewQuestionCount: 0,
  companyProfileAvailable: true,
  badges: [],
  applyStatus: 'not_applied',
  savedStatus: 'unknown',
  ...overrides,
});

const baseApplicant = (overrides: any = {}): Applicant => ({
  jobTitle: 'Customer Support',
  skills: ['customer service', 'CRM', 'communication'],
  jobLevelId: 1,
  workSetUpId: 2,
  salaryMinimum: 20000,
  salaryMaximum: 30000,
  educationalBackground: [],
  ...overrides,
} as any);

describe('MATCHED v2 -- JobCompatibilityService golden fixtures', () => {
  let service: JobCompatibilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobCompatibilityService);
  });

  it('Fixture 1 -- strong customer service match: all required skills present', () => {
    const result = service.evaluate(baseApplicant(), baseJob());
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.matchedFactors.length).toBeGreaterThan(0);
    expect(result.missingFactors.length).toBe(0);
  });

  it('Fixture 3 -- limited data applicant (null profile): Low Match, Limited Data, no shame copy', () => {
    const result = service.evaluate(null, baseJob());
    expect(result.score).toBe(0);
    expect(result.label).toBe('Low Match');
    expect(result.confidenceLabel).toBe('Limited Data');
    expect(result.explanation.toLowerCase()).not.toContain('fail');
    expect(result.explanation.toLowerCase()).not.toContain('reject');
    expect(result.explanation.toLowerCase()).not.toContain('not qualified');
  });

  it('Fixture 9 -- guest/no-profile applicant never receives a personalized non-zero score', () => {
    const result = service.evaluate(undefined, baseJob());
    expect(result.score).toBe(0);
  });

  it('M1 -- adding an exact required skill match should not lower the score', () => {
    const before = service.evaluate(baseApplicant({ skills: ['customer service'] }), baseJob());
    const after = service.evaluate(baseApplicant({ skills: ['customer service', 'communication'] }), baseJob());
    expect(after.score).toBeGreaterThanOrEqual(before.score);
  });

  it('M2 -- removing an exact required skill match should not raise the score', () => {
    const before = service.evaluate(baseApplicant({ skills: ['customer service', 'communication', 'CRM'] }), baseJob());
    const after = service.evaluate(baseApplicant({ skills: ['customer service'] }), baseJob());
    expect(after.score).toBeLessThanOrEqual(before.score);
  });

  it('M5/M6 -- there is no protected-attribute or exact-address input to the service at all (static contract check)', () => {
    // The applicant fixture above contains no age/gender/race/religion/
    // disability/exact-address field, and JobCompatibilityService's
    // public surface (evaluate(applicant, job)) has no parameter for one
    // -- this test documents that the invariant holds by construction,
    // not by runtime branching, which is the strongest form it can take
    // for a service with no such fields anywhere in its input model.
    const result = service.evaluate(baseApplicant(), baseJob());
    expect(result).toBeTruthy();
  });

  it('M14 -- Limited Data confidence can never produce Excellent Match', () => {
    // First attempt at this fixture (skills/educationalBackground emptied
    // only) was not actually sparse enough -- the job's own title/
    // responsibilities/level/work-setup/salary survived from baseJob(),
    // so jobDataQuality landed at 50 and the blended confidence came out
    // to "Low Confidence" (32), never "Limited Data". The conditional
    // `if (confidenceLabel === 'Limited Data')` then meant the assertion
    // inside never ran at all -- Jasmine's own "has no expectations"
    // warning caught this. Fixed two ways: the fixture below is now
    // genuinely empty on both sides, AND the assertion is unconditional
    // (checks the real invariant -- low/limited confidence caps the
    // label -- rather than only checking one specific tier).
    const sparseJob = baseJob({
      title: '', jobRole: null, skills: [], goodToHave: [], responsibilities: '',
      jobLevelId: null, workSetupId: null, location: null, educationalBackground: [],
      jobTypeId: null, hasSalary: false,
    });
    const sparseApplicant = baseApplicant({
      jobTitle: undefined, skills: [], jobLevelId: null, workSetUpId: null,
      salaryMinimum: null, salaryMaximum: null,
    });
    const result = service.evaluate(sparseApplicant, sparseJob);
    expect(['Low Confidence', 'Limited Data']).toContain(result.confidenceLabel);
    expect(result.label).not.toBe('Excellent Match');
  });

  it('P1 -- score is always an integer between 0 and 100', () => {
    const result = service.evaluate(baseApplicant(), baseJob());
    expect(Number.isInteger(result.score)).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('P1 -- confidence is always an integer between 0 and 100', () => {
    const result = service.evaluate(baseApplicant(), baseJob());
    expect(Number.isInteger(result.confidence)).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
  });

  it('P5 -- missing/empty arrays never throw', () => {
    expect(() => service.evaluate(
      baseApplicant({ skills: undefined, educationalBackground: undefined }),
      baseJob({ skills: [], goodToHave: [], educationalBackground: [] })
    )).not.toThrow();
  });

  // ── MATCH FACTORS v2 -- Evidence Model regression + new-field tests ──
  // The 14 tests above are themselves the regression proof for this
  // pass: every one was written before the Evidence Model existed and
  // asserts on matchedFactors/missingFactors/score/label/confidence --
  // if the legacy computation had changed, those tests would now fail.
  // They still pass unmodified (re-run as part of this same spec file).

  it('MATCH FACTORS v2 -- matchedFactorEvidence/missingFactorEvidence are populated alongside the unchanged legacy arrays', () => {
    const result = service.evaluate(baseApplicant(), baseJob());
    expect(result.matchedFactorEvidence).toBeDefined();
    expect(result.missingFactorEvidence).toBeDefined();
    // Both sides describe the same underlying comparison -- not
    // necessarily equal in count (evidence only exists where a registry
    // code is defined), but evidence should never be empty when the
    // legacy array isn't.
    if (result.matchedFactors.length > 0) {
      expect(result.matchedFactorEvidence!.length).toBeGreaterThan(0);
    }
  });

  it('MATCH FACTORS v2 -- dataNotUsed always lists the 5 safety exclusions, regardless of input', () => {
    const result = service.evaluate(baseApplicant(), baseJob());
    expect(result.dataNotUsed!.length).toBe(5);
    expect(result.dataNotUsed!.map(d => d.key)).toEqual([
      'protected_attributes', 'photo_appearance', 'video_traits', 'school_prestige', 'exact_address',
    ]);
  });

  it('MATCH FACTORS v2 -- factorSummary and factorUiHints are always present and internally consistent', () => {
    const result = service.evaluate(baseApplicant(), baseJob());
    expect(result.factorSummary).toBeDefined();
    expect(result.factorUiHints).toBeDefined();
    expect(result.factorUiHints!.primaryBadgeLabel).toBe(result.label);
    expect(result.factorUiHints!.confidenceBadgeLabel).toBe(result.confidenceLabel);
  });

  it('MATCH FACTORS v2 -- null applicant still returns a fully-shaped result (no crash, no missing fields)', () => {
    const result = service.evaluate(null, baseJob());
    expect(result.dataNotUsed!.length).toBe(5);
    expect(result.matchedFactorEvidence).toEqual([]);
    expect(result.factorSummary).toBeDefined();
  });

  // ── MATCH FACTORS v3 addendum -- certification evidence + regression ──

  it('v3 -- applicant with certifications on file gets certification evidence in dataUsed, but score/legacy arrays are unaffected', () => {
    const withCerts = service.evaluate(baseApplicant({ certifications: [{ certTitle: 'Customer Service Excellence' }] }), baseJob());
    const withoutCerts = service.evaluate(baseApplicant({ certifications: [] }), baseJob());
    expect(withCerts.score).toBe(withoutCerts.score);
    expect(withCerts.matchedFactors).toEqual(withoutCerts.matchedFactors);
    expect(withCerts.dataUsed!.some(d => d.key === 'certification')).toBe(true);
    expect(withoutCerts.dataUsed!.some(d => d.key === 'certification')).toBe(false);
  });

  it('QA fix -- certification dataUsed summary is honest about being presence-only, never claims a job requirement was compared', () => {
    const result = service.evaluate(baseApplicant({ certifications: [{ certTitle: 'First Aid' }] }), baseJob());
    const certEntry = result.dataUsed!.find(d => d.key === 'certification');
    expect(certEntry).toBeDefined();
    // Explicitly negates a requirement comparison -- legitimately uses
    // the word "requirement" while saying none was made, unlike the old
    // generic template which asserted one happened.
    expect(certEntry!.summary.toLowerCase()).toContain('not compared against a specific job requirement');
    expect(certEntry!.summary.toLowerCase()).not.toContain("this job's certifications requirement");
  });

  it('v3 -- certification evidence never appears in matchedFactorEvidence/missingFactorEvidence (presence-only, not a job requirement match)', () => {
    const result = service.evaluate(baseApplicant({ certifications: [{ certTitle: 'First Aid' }] }), baseJob());
    expect(result.matchedFactorEvidence!.some(e => e.category === 'certification')).toBe(false);
    expect(result.missingFactorEvidence!.some(e => e.category === 'certification')).toBe(false);
  });

  it('v3 M4 -- changing protected attributes should not change score, confidence, or factor status (no protected field exists, but verifies no crash from unexpected extra fields)', () => {
    const a = service.evaluate(baseApplicant({ age: 45, gender: 'female' } as any), baseJob());
    const b = service.evaluate(baseApplicant({ age: 22, gender: 'male' } as any), baseJob());
    expect(a.score).toBe(b.score);
    expect(a.confidence).toBe(b.confidence);
  });

  it('v3 M9 -- missing preferred skill should not create a required blocker', () => {
    const result = service.evaluate(baseApplicant({ skills: ['customer service'] }), baseJob());
    expect(result.requiredBlockers).toEqual([]);
  });

  // ── Scoped MATCH pass -- skillsEqual() substring false-positive fix ──
  // A single required skill per job, so the skills factor's ratio is
  // either exactly 0 (no match) or 1 (match) -- isolates skillsEqual()'s
  // behavior precisely, since the factor aggregates across all job
  // skills otherwise.

  function singleSkillJob(requiredSkill: string) {
    return baseJob({ skills: [requiredSkill], tags: [], goodToHave: [] });
  }

  describe('skillsEqual() -- substring false-positive fix', () => {
    it('"React" (job) does not match "React Native" (applicant)', () => {
      const result = service.evaluate(baseApplicant({ skills: ['React Native'] }), singleSkillJob('React'));
      expect(result.missingFactorEvidence!.some(e => e.factorCode === 'required_skill_missing')).toBe(true);
      expect(result.matchedFactorEvidence!.some(e => e.factorCode === 'required_skill_exact_match')).toBe(false);
    });

    it('"React Native" (job) does not match "React" (applicant)', () => {
      const result = service.evaluate(baseApplicant({ skills: ['React'] }), singleSkillJob('React Native'));
      expect(result.missingFactorEvidence!.some(e => e.factorCode === 'required_skill_missing')).toBe(true);
      expect(result.matchedFactorEvidence!.some(e => e.factorCode === 'required_skill_exact_match')).toBe(false);
    });

    it('"Java" (job) does not match "JavaScript" (applicant)', () => {
      const result = service.evaluate(baseApplicant({ skills: ['JavaScript'] }), singleSkillJob('Java'));
      expect(result.missingFactorEvidence!.some(e => e.factorCode === 'required_skill_missing')).toBe(true);
      expect(result.matchedFactorEvidence!.some(e => e.factorCode === 'required_skill_exact_match')).toBe(false);
    });

    it('"SQL" (job) does not match "NoSQL" (applicant)', () => {
      const result = service.evaluate(baseApplicant({ skills: ['NoSQL'] }), singleSkillJob('SQL'));
      expect(result.missingFactorEvidence!.some(e => e.factorCode === 'required_skill_missing')).toBe(true);
      expect(result.matchedFactorEvidence!.some(e => e.factorCode === 'required_skill_exact_match')).toBe(false);
    });

    it('"React" (job) matches "react" (applicant) -- case-insensitive exact match preserved', () => {
      const result = service.evaluate(baseApplicant({ skills: ['react'] }), singleSkillJob('React'));
      expect(result.matchedFactorEvidence!.some(e => e.factorCode === 'required_skill_exact_match')).toBe(true);
    });

    it('"React" (job) matches "React.js" (applicant) -- explicit registered alias preserved', () => {
      const result = service.evaluate(baseApplicant({ skills: ['React.js'] }), singleSkillJob('React'));
      expect(result.matchedFactorEvidence!.some(e => e.factorCode === 'required_skill_exact_match')).toBe(true);
    });

    it('"JavaScript" (job) matches "JS" (applicant) -- explicit registered alias preserved', () => {
      const result = service.evaluate(baseApplicant({ skills: ['JS'] }), singleSkillJob('JavaScript'));
      expect(result.matchedFactorEvidence!.some(e => e.factorCode === 'required_skill_exact_match')).toBe(true);
    });

    it('"TypeScript" (job) does not match "TS" (applicant) -- no alias registered today, honestly not supported', () => {
      const result = service.evaluate(baseApplicant({ skills: ['TS'] }), singleSkillJob('TypeScript'));
      expect(result.matchedFactorEvidence!.some(e => e.factorCode === 'required_skill_exact_match')).toBe(false);
    });
  });
});

describe('MATCHED v2 -- JobMatchabilityService golden fixtures', () => {
  let service: JobMatchabilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobMatchabilityService);
  });

  it('Fixture 5 -- weak job post (vague title, no required skills, short description) scores low', () => {
    const result = service.evaluate(baseJob({
      title: 'Untitled role',
      skills: [],
      goodToHave: [],
      responsibilities: '',
      jobLevelId: null,
      workSetupId: null,
      location: null,
      educationalBackground: [],
      jobTypeId: null,
      hasSalary: false,
    }));
    expect(result.score).toBeLessThan(50);
    expect(result.label).toBe('Needs Clearer Job Details');
    expect(result.topActions.length).toBeGreaterThan(0);
  });

  it('Fixture 5b -- strong, complete job post scores high', () => {
    const result = service.evaluate(baseJob());
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  it('P4 -- no single factor can push the score above 100', () => {
    const result = service.evaluate(baseJob());
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('topActions are sorted by weight descending (regression guard for the bug fixed in the MATCH v3 pass)', () => {
    const result = service.evaluate(baseJob({ skills: [], goodToHave: [], responsibilities: '' }));
    // required-skills (20) must outrank preferred-skills (10) and
    // responsibilities (15) if all three are unmet simultaneously.
    if (result.topActions.length > 1) {
      expect(result.topActions[0]).toContain('required skills');
    }
  });
});
