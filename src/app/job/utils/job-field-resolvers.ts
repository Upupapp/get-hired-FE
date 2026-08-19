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

export function resolveJobTypeId(hint: string | null | undefined): number | null {
  if (!hint) return null;
  const h = hint.toLowerCase().trim();
  if (h.includes('full') && h.includes('time')) return 1;
  if (h.includes('part') && h.includes('time')) return 2;
  if (h.includes('contract')) return 3;
  if (h.includes('intern')) return 4;
  if (h.includes('freelance')) return 5;
  return null;
}
