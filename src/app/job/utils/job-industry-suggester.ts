/**
 * GETHIRED_EMPLOYER_AI_CREATE_PERSISTENT_UNFINISHED_JOB_DRAFT_FLOW_SINGLE_COMMAND_V2
 *
 * Deterministic, conservative Job Title -> Industry NAME suggester.
 * Returns a NAME (e.g. "Information Technology"), not an id -- the caller
 * is responsible for matching that name (case-insensitively) against
 * whatever the live GET /job/industries list actually contains at runtime
 * (see JobService.getIndustryList(), already used by
 * create-job-post-step.component.html's real Industry dropdown) and only
 * using the id if a match is found. That keeps this suggester honest even
 * if the deployed Industry taxonomy differs from the keyword list below --
 * no existing reliable title->industry inference exists anywhere else in
 * this codebase (backend AI generation does role/seniority intent, not
 * industry classification), so this is deliberately small, explicit, and
 * conservative rather than a broad model.
 *
 * Ambiguous/generic titles (Manager, Assistant, Coordinator, Officer,
 * Consultant, Specialist, Associate, Representative, Staff) never match
 * anything on their own -- they simply aren't present in any keyword list
 * below, so a bare "Manager" (or "IT Manager", "Marketing Coordinator",
 * etc., where no other reliable keyword is present) correctly returns null.
 */

interface IndustryKeywordGroup {
  industryName: string;
  keywords: string[];
}

const KEYWORD_GROUPS: IndustryKeywordGroup[] = [
  {
    industryName: 'Information Technology',
    keywords: [
      'software engineer', 'software developer', 'developer', 'programmer',
      'devops', 'system administrator', 'systems admin', 'it support',
      'network engineer', 'qa engineer', 'quality assurance engineer',
      'data engineer', 'data scientist', 'web developer', 'full stack',
      'frontend developer', 'backend developer', 'ui/ux designer', 'ux designer',
      'database administrator', 'cybersecurity', 'cloud engineer',
    ],
  },
  {
    industryName: 'Healthcare',
    keywords: [
      'nurse', 'physician', 'doctor', 'medical technologist', 'caregiver',
      'pharmacist', 'dentist', 'therapist', 'radiologic technologist',
      'medical assistant', 'healthcare',
    ],
  },
  {
    industryName: 'Finance & Banking',
    keywords: [
      'accountant', 'auditor', 'bank teller', 'financial analyst',
      'bookkeeper', 'credit analyst', 'loan officer', 'treasury analyst',
    ],
  },
  {
    industryName: 'Education',
    keywords: ['teacher', 'professor', 'tutor', 'instructor', 'academic'],
  },
  {
    industryName: 'Retail & E-commerce',
    keywords: [
      'retail associate', 'sales associate', 'cashier', 'merchandiser',
      'store supervisor', 'e-commerce', 'ecommerce',
    ],
  },
  {
    industryName: 'Manufacturing',
    keywords: [
      'factory worker', 'machine operator', 'production worker',
      'manufacturing', 'quality control inspector', 'assembly line',
    ],
  },
  {
    industryName: 'Construction & Real Estate',
    keywords: [
      'civil engineer', 'architect', 'construction worker', 'foreman',
      'real estate agent', 'contractor', 'site engineer',
    ],
  },
  {
    industryName: 'Hospitality & Tourism',
    keywords: [
      'hotel', 'chef', 'cook', 'waiter', 'waitress', 'tourism',
      'hospitality', 'housekeeping', 'barista', 'concierge', 'bartender',
    ],
  },
  {
    industryName: 'Transportation & Logistics',
    keywords: [
      'driver', 'logistics', 'warehouse', 'courier', 'dispatcher',
      'supply chain', 'freight', 'fleet',
    ],
  },
  {
    industryName: 'Media & Entertainment',
    keywords: [
      'video editor', 'graphic designer', 'content creator', 'photographer',
      'journalist', 'broadcaster', 'animator',
    ],
  },
  {
    industryName: 'Professional Services',
    keywords: ['lawyer', 'attorney', 'paralegal', 'hr generalist', 'recruiter'],
  },
  {
    industryName: 'Telecommunications',
    keywords: ['telecom', 'network technician'],
  },
];

function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

/** Returns a suggested Industry NAME, or null if the title doesn't contain
 *  a strong-enough, unambiguous signal. Never throws. */
export function suggestIndustryName(jobTitle: string | null | undefined): string | null {
  if (!jobTitle) return null;
  const t = normalize(jobTitle);
  if (!t) return null;

  for (const group of KEYWORD_GROUPS) {
    if (group.keywords.some((k) => t.includes(k))) {
      return group.industryName;
    }
  }
  return null;
}

/** Matches a suggested industry NAME against the live, currently-loaded
 *  Industry options list (from GET /job/industries), case-insensitively.
 *  Returns the matching option, or null if the suggested name isn't
 *  actually one of the options currently offered -- the caller should treat
 *  that exactly like "no suggestion" rather than force a value the
 *  dropdown doesn't actually contain. */
export function matchSuggestedIndustry<T extends { id: any; name: string }>(
  suggestedName: string | null,
  liveOptions: T[] | null | undefined
): T | null {
  if (!suggestedName || !liveOptions || !liveOptions.length) return null;
  const target = normalize(suggestedName);
  return liveOptions.find((opt) => opt && normalize(opt.name) === target) || null;
}
