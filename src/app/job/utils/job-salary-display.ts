/**
 * EMP-019 fix.
 *
 * Small, shared helpers for the exact defect three independent formatSalary()
 * implementations (job-list, job-expired, job-applicants components) shared:
 * unconditionally interpolating the salary period/rate into the displayed
 * string -- `(${rate})` -- even when rate is null/undefined, rendering
 * literal "(null)"/"(undefined)" to real users. Confirmed against real data:
 * gethired.jobs has published rows with a genuine salary_minimum/maximum but
 * rate: null (period is legitimately optional, not a creation-flow bug).
 *
 * Deliberately narrow -- this does NOT attempt to unify currency formatting
 * (job-list uses Angular's locale-aware CurrencyPipe with the job's real
 * currency; job-expired/job-applicants hardcode a ₱ prefix and never receive
 * a currency field at all) -- that's a separate, larger, out-of-scope
 * inconsistency this fix does not touch.
 */

/** True only when both values are present (nullish-safe -- a legitimate
 *  salary of 0 is not treated as "missing" the way `if (min && max)` would). */
export function hasSalaryRange(
  salaryMin: number | string | null | undefined,
  salaryMax: number | string | null | undefined
): boolean {
  return salaryMin !== null && salaryMin !== undefined && salaryMin !== ''
    && salaryMax !== null && salaryMax !== undefined && salaryMax !== '';
}

/** " (Monthly)" when a real period exists, or "" when it doesn't -- never
 *  "(null)"/"(undefined)". Append directly after the formatted range. */
export function formatSalaryPeriodSuffix(rate: string | null | undefined): string {
  return rate ? ` (${rate})` : '';
}
