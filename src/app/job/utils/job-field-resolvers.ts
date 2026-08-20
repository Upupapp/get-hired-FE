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

// STORAGE-SAFETY / DRAFT-SAVE FIX: gethired.job_type only seeds ids 1-3
// (Full time / Part time / Contractor -- see db/job_ddl.sql). 'intern' and
// 'freelance' previously resolved to ids 4/5, which don't exist in that
// table -- job_type_id is a real FK there, so persisting either one (e.g.
// the AI Create Generate step's "Freelance" option) failed the INSERT with
// an FK violation, surfacing as "Couldn't auto-save your AI draft." Per the
// project's own rule for Industry (job-industry-suggester.ts): never invent
// an id that isn't in the live options -- return null (unset) instead of a
// value the database will reject.
export function resolveJobTypeId(hint: string | null | undefined): number | null {
  if (!hint) return null;
  const h = hint.toLowerCase().trim();
  if (h.includes('full') && h.includes('time')) return 1;
  if (h.includes('part') && h.includes('time')) return 2;
  if (h.includes('contract')) return 3;
  return null;
}
