import { MatchFactorEvidence } from './match-factor.model';
import { canonicalFactorKey, dedupeGroup, mergeEvidenceSources, keepHighestImportance, strongestReliability, capScoreImpact } from './match-factor-adapter';

/**
 * Coverage gap closed by the QA sweep of the MATCH FACTORS v3 addendum:
 * these dedup/merge helpers were real, exported functions with zero test
 * coverage (and zero production callers -- see
 * GETHIRED_MATCH_FACTOR_V3_QA_SWEEP_REPORT.md). Not wired into any live
 * path by these tests; this only proves the standalone logic is correct
 * for whenever a future pass builds skill-level evidence to dedupe.
 */

const baseEvidence = (overrides: Partial<MatchFactorEvidence> = {}): MatchFactorEvidence => ({
  factorId: 'skills-matched',
  factorCode: 'required_skill_exact_match',
  label: 'Required skill found',
  shortLabel: 'Skill matched',
  category: 'required_skill',
  subcategory: 'skills',
  status: 'matched',
  audience: 'applicant',
  visibility: 'primary',
  importance: 'critical',
  matchType: 'exact',
  source: 'profile_skill',
  sourceLabel: 'Your GetHired profile',
  sourceVisibility: 'both',
  evidenceStrength: 'high',
  confidenceImpact: 10,
  scoreImpact: 30,
  maxScoreImpact: 30,
  weightGroup: 'skills',
  confidenceReason: 'Both sides had data for this comparison.',
  explanation: 'skills',
  applicantCopy: 'Your profile shows this: skills.',
  employerCopy: 'Submitted information shows: skills.',
  createdBy: 'rules_engine',
  modelVersion: 'match_factors_v3_addendum_1',
  ...overrides,
});

describe('match-factor-adapter -- dedup/merge helpers (QA sweep coverage gap)', () => {
  it('canonicalFactorKey returns the canonical key for a registered alias', () => {
    const aliases = { javascript: ['js'] };
    expect(canonicalFactorKey('JS', aliases)).toBe('javascript');
    expect(canonicalFactorKey('JavaScript', aliases)).toBe('javascript');
  });

  it('canonicalFactorKey falls back to the normalized label when no alias matches', () => {
    expect(canonicalFactorKey('Excel', {})).toBe('excel');
  });

  it('dedupeGroup groups evidence by canonical key, not by raw subcategory string', () => {
    const groups = dedupeGroup([
      baseEvidence({ factorId: 'a', subcategory: 'javascript' }),
      baseEvidence({ factorId: 'b', subcategory: 'js' }),
      baseEvidence({ factorId: 'c', subcategory: 'excel' }),
    ], { javascript: ['js'] });
    expect(groups.size).toBe(2);
    expect(groups.get('javascript')!.length).toBe(2);
    expect(groups.get('excel')!.length).toBe(1);
  });

  it('mergeEvidenceSources caps the confidence boost rather than summing unboundedly', () => {
    const merged = mergeEvidenceSources([
      baseEvidence({ factorId: 'a', confidenceImpact: 10 }),
      baseEvidence({ factorId: 'b', confidenceImpact: 10 }),
      baseEvidence({ factorId: 'c', confidenceImpact: 10 }),
      baseEvidence({ factorId: 'd', confidenceImpact: 10 }),
      baseEvidence({ factorId: 'e', confidenceImpact: 10 }),
    ]);
    // 4 extra sources * 3 = 12, capped at 10
    expect(merged.confidenceImpact).toBe(20);
  });

  it('mergeEvidenceSources never multiplies scoreImpact beyond maxScoreImpact', () => {
    const merged = mergeEvidenceSources([
      baseEvidence({ factorId: 'a', scoreImpact: 30, maxScoreImpact: 30 }),
      baseEvidence({ factorId: 'b', scoreImpact: 30, maxScoreImpact: 30 }),
    ]);
    expect(merged.scoreImpact).toBe(30);
  });

  it('mergeEvidenceSources throws on an empty group rather than silently returning a fake record', () => {
    expect(() => mergeEvidenceSources([])).toThrowError();
  });

  it('keepHighestImportance picks the critical-importance item over lower-importance ones', () => {
    const group = [
      baseEvidence({ factorId: 'a', importance: 'low' }),
      baseEvidence({ factorId: 'b', importance: 'critical' }),
      baseEvidence({ factorId: 'c', importance: 'medium' }),
    ];
    expect(keepHighestImportance(group).factorId).toBe('b');
  });

  it('strongestReliability picks confirmed_multiple_sources over weaker reliabilities', () => {
    expect(strongestReliability(['inferred_low', 'confirmed_multiple_sources', 'single_source_medium'])).toBe('confirmed_multiple_sources');
  });

  it('strongestReliability falls back to unclear_limited for an empty list', () => {
    expect(strongestReliability([])).toBe('unclear_limited');
  });

  it('capScoreImpact clamps to maxScoreImpact when provided', () => {
    expect(capScoreImpact(45, 30)).toBe(30);
    expect(capScoreImpact(10, 30)).toBe(10);
  });

  it('capScoreImpact returns the raw value unchanged when no max is set', () => {
    expect(capScoreImpact(45, undefined)).toBe(45);
  });
});
