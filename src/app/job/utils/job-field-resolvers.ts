/**
 * Centralized free-text -> canonical-id resolvers for job form fields that
 * use a fixed FE enum (unlike job level, which is a live backend-owned list
 * -- see job-level-resolver.ts for that one). Extracted so any caller that
 * needs to map a hint string (AI assistant, guest job draft, etc.) into the
 * same ids the manual "Create a Job / From Scratch" form uses shares one
 * implementation instead of each maintaining its own copy.
 */

export function resolveWorkSetupId(hint: string | null | undefined): number | null {
  if (!hint) return null;
  const h = hint.toLowerCase().trim();
  if (h.includes('remote') || h === 'wfh' || h.includes('work from home')) return 2;
  if (h.includes('hybrid')) return 3;
  if (h.includes('onsite') || h.includes('on-site') || h.includes('on site') || h.includes('office')) return 1;
  return null;
}

// BUGFIX (Freelance/Internship silently saved as null): gethired.job_type
// used to only seed ids 1-3 (Full time / Part time / Contractor), so this
// resolver mapped "Freelance" to a frontend-only sentinel string that every
// submission path then converted to `null` before it ever reached the
// backend, and had no mapping for "Internship" at all (fell through to
// null). Real rows now exist for both (job_type_id 4 = Freelance,
// 5 = Internship -- confirmed against gethired.job_type), so both are
// mapped to their real ids like every other type, and no longer need any
// special-case handling downstream (formatJob(), the AI assistant's draft
// persistence, the readiness gate, or the preview step's type lookup).
export function resolveJobTypeId(hint: string | null | undefined): number | null {
  if (!hint) return null;
  const h = hint.toLowerCase().trim();
  if (h.includes('full') && h.includes('time')) return 1;
  if (h.includes('part') && h.includes('time')) return 2;
  if (h.includes('contract')) return 3;
  if (h.includes('freelance')) return 4;
  if (h.includes('intern')) return 5;
  return null;
}
