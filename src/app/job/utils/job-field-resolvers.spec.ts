import {
  resolveJobTypeId,
  resolveWorkSetupId,
} from './job-field-resolvers';

/**
 * These two resolvers are the single mapping from free text (AI assistant output,
 * guest job drafts, imported postings) to the ids the manual Create-a-Job form uses.
 * A silent change here mis-files a job's work setup or employment type without any
 * visible error, so the id values themselves are asserted, not just "not null".
 */
describe('job-field-resolvers', () => {

  describe('resolveWorkSetupId', () => {
    it('maps remote phrasings to 2', () => {
      expect(resolveWorkSetupId('Remote')).toBe(2);
      expect(resolveWorkSetupId('fully remote')).toBe(2);
      expect(resolveWorkSetupId('wfh')).toBe(2);
      expect(resolveWorkSetupId('Work From Home')).toBe(2);
    });

    it('maps hybrid to 3', () => {
      expect(resolveWorkSetupId('Hybrid')).toBe(3);
      expect(resolveWorkSetupId('hybrid - 3 days in office')).toBe(3);
    });

    it('maps onsite phrasings to 1', () => {
      expect(resolveWorkSetupId('Onsite')).toBe(1);
      expect(resolveWorkSetupId('On-site')).toBe(1);
      expect(resolveWorkSetupId('on site')).toBe(1);
      expect(resolveWorkSetupId('In office')).toBe(1);
    });

    it('is case- and whitespace-insensitive', () => {
      expect(resolveWorkSetupId('   REMOTE   ')).toBe(2);
    });

    it('returns null rather than guessing for unknown or empty input', () => {
      expect(resolveWorkSetupId('anywhere')).toBeNull();
      expect(resolveWorkSetupId('')).toBeNull();
      expect(resolveWorkSetupId(null)).toBeNull();
      expect(resolveWorkSetupId(undefined)).toBeNull();
    });

    it('checks hybrid before onsite, so "hybrid in office" is hybrid not onsite', () => {
      // Both substrings are present; ordering decides. Getting this backwards
      // would silently file every hybrid role as onsite.
      expect(resolveWorkSetupId('hybrid, 2 days in office')).toBe(3);
    });
  });

  describe('resolveJobTypeId', () => {
    it('maps full time to 1 and part time to 2', () => {
      expect(resolveJobTypeId('Full Time')).toBe(1);
      expect(resolveJobTypeId('full-time')).toBe(1);
      expect(resolveJobTypeId('Part Time')).toBe(2);
      expect(resolveJobTypeId('part-time')).toBe(2);
    });

    it('maps contract to 3', () => {
      expect(resolveJobTypeId('Contract')).toBe(3);
      expect(resolveJobTypeId('Contractor')).toBe(3);
    });

    it('returns null for unknown or empty input', () => {
      expect(resolveJobTypeId('Seasonal')).toBeNull();
      expect(resolveJobTypeId('')).toBeNull();
      expect(resolveJobTypeId(null)).toBeNull();
    });

    // ---------------------------------------------------------------------
    // Freelance (4) and Internship (5) are real gethired.job_type rows --
    // see the BUGFIX comment on resolveJobTypeId() for why this used to
    // return a sentinel/null instead.
    // ---------------------------------------------------------------------
    it('maps freelance to 4', () => {
      expect(resolveJobTypeId('Freelance')).toBe(4);
      expect(resolveJobTypeId('freelance')).toBe(4);
    });

    it('maps internship to 5', () => {
      expect(resolveJobTypeId('Internship')).toBe(5);
      expect(resolveJobTypeId('paid internship')).toBe(5);
    });

    it('prefers contract over freelance when both words appear', () => {
      // 'contract' is checked first; a "freelance contract" is a real job_type
      // row (3) and should not resolve to freelance instead.
      expect(resolveJobTypeId('freelance contract')).toBe(3);
    });
  });
});
