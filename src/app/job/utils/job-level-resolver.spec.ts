import { LevelOption, resolveJobLevelId } from './job-level-resolver';

/**
 * Job levels are a live backend-owned list, so this resolver must never hardcode
 * an id -- it searches whatever options the caller passes. The confidence value
 * is part of the contract: callers use 'high' to auto-fill and 'medium' to
 * suggest, so a level silently returned at the wrong confidence changes whether
 * an Employer's form gets filled in for them.
 */
describe('resolveJobLevelId', () => {

  const LEVELS: LevelOption[] = [
    { id: 10, name: 'Entry Level' },
    { id: 20, name: 'Mid Level' },
    { id: 30, name: 'Senior' },
    { id: 40, name: 'Team Lead' },
    { id: 50, name: 'Manager' },
  ];

  describe('no match possible', () => {
    it('returns none for empty, null or undefined hints', () => {
      for (const hint of ['', '   ', null, undefined]) {
        const r = resolveJobLevelId(hint, LEVELS);
        expect(r.id).withContext(`hint=${JSON.stringify(hint)}`).toBeNull();
        expect(r.confidence).toBe('none');
      }
    });

    it('returns none when the level list is empty or missing', () => {
      expect(resolveJobLevelId('Senior', []).confidence).toBe('none');
      expect(resolveJobLevelId('Senior', null as any).confidence).toBe('none');
    });

    it('returns none for a hint that matches nothing', () => {
      const r = resolveJobLevelId('purple monkey dishwasher', LEVELS);
      expect(r.id).toBeNull();
      expect(r.confidence).toBe('none');
    });

    it('never invents an id when it cannot match', () => {
      expect(resolveJobLevelId('astronaut', LEVELS).id).toBeNull();
    });
  });

  describe('high confidence', () => {
    it('matches an exact name regardless of case and punctuation', () => {
      const r = resolveJobLevelId('senior', LEVELS);
      expect(r.id).toBe(30);
      expect(r.confidence).toBe('high');
      expect(r.matchedName).toBe('Senior');
    });

    it('matches when the hint contains the level name', () => {
      const r = resolveJobLevelId('Manager, retail division', LEVELS);
      expect(r.id).toBe(50);
      expect(r.confidence).toBe('high');
    });

    it('normalises punctuation before comparing', () => {
      const r = resolveJobLevelId('Mid-Level!', LEVELS);
      expect(r.id).toBe(20);
      expect(r.confidence).toBe('high');
    });

    it('returns the id from the supplied list, never a hardcoded one', () => {
      const renumbered: LevelOption[] = [{ id: 999, name: 'Senior' }];
      expect(resolveJobLevelId('Senior', renumbered).id).toBe(999);
    });
  });

  describe('synonym buckets (medium confidence)', () => {
    it('maps a junior synonym to the entry-level option', () => {
      const r = resolveJobLevelId('Junior developer', LEVELS);
      expect(r.id).toBe(10);
      expect(r.confidence).toBe('medium');
    });

    it('maps "fresh graduate" to entry level', () => {
      expect(resolveJobLevelId('fresh graduate', LEVELS).id).toBe(10);
    });

    it('maps a supervisor synonym to the lead option', () => {
      const r = resolveJobLevelId('Supervisor', LEVELS);
      expect(r.id).toBe(40);
      expect(r.confidence).toBe('medium');
    });

    it('maps an executive synonym to the manager option', () => {
      expect(resolveJobLevelId('VP of Engineering', LEVELS).id).toBe(50);
    });
  });

  describe('years-of-experience fallback', () => {
    it('reads 1 year as entry level', () => {
      const r = resolveJobLevelId('1 year experience', LEVELS);
      expect(r.id).toBe(10);
      expect(r.confidence).toBe('medium');
    });

    it('reads 3 years as mid level', () => {
      expect(resolveJobLevelId('3 years experience', LEVELS).id).toBe(20);
    });

    it('reads 6 years as senior', () => {
      expect(resolveJobLevelId('6+ years experience', LEVELS).id).toBe(30);
    });

    it('reads 10 years as manager', () => {
      expect(resolveJobLevelId('10+ years of experience', LEVELS).id).toBe(50);
    });

    it('prefers an explicit synonym over the years number', () => {
      // 'senior' is a bucket word and is checked before the years fallback, so
      // this must not be downgraded to entry level by the "1 year" text.
      expect(resolveJobLevelId('senior, 1 year in role', LEVELS).id).toBe(30);
    });
  });

  describe('bucket words that have no matching option', () => {
    it('returns none when the bucket exists but the list has no such level', () => {
      const sparse: LevelOption[] = [{ id: 1, name: 'Executive Search' }];
      // 'junior' resolves to the entry bucket, but no option contains an
      // entry-bucket word, so there is nothing legitimate to return.
      const r = resolveJobLevelId('junior', sparse);
      expect(r.id).toBeNull();
      expect(r.confidence).toBe('none');
    });
  });
});
