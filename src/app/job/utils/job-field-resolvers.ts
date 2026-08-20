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
// (Full time / Part time / Contractor -- see db/job_ddl.sql). job_type_id
// is a real FK there, so no id can be invented for "Freelance" -- there is
// no backend row for it (see get-hired-BE/notes.md for the requested fix).
// FREELANCE_JOB_TYPE_SENTINEL is a frontend-only placeholder value so
// "Freelance" can still be selected and carried across every Employment
// Type dropdown in the app (AI Create's, and the canonical Role Basics
// step's) without ever being sent to the backend as a fabricated id --
// every submission path converts it to `null` first (see
// JobCreateComponent.formatJob()). Never persisted, never a real
// job_type_id, purely a UI selection marker.
export const FREELANCE_JOB_TYPE_SENTINEL = 'freelance';

export function resolveJobTypeId(hint: string | null | undefined): number | string | null {
  if (!hint) return null;
  const h = hint.toLowerCase().trim();
  if (h.includes('full') && h.includes('time')) return 1;
  if (h.includes('part') && h.includes('time')) return 2;
  if (h.includes('contract')) return 3;
  if (h.includes('freelance')) return FREELANCE_JOB_TYPE_SENTINEL;
  return null;
}
