/**
 * EMP-014 fix.
 *
 * Deterministic, conservative Job Title -> Job Category NAME suggester --
 * same structure and same conservatism as job-industry-suggester.ts's
 * suggestIndustryName()/matchSuggestedIndustry(), which this file's caller
 * (easy-job-post-assistant-modal.component.ts) reuses directly for the
 * live-option match rather than duplicating that logic.
 *
 * Returns a NAME (e.g. "Software Development"), not an id -- the caller
 * matches that name against whatever GET /job/category actually returns at
 * runtime (job.service.ts's getCategoryList(), the same live list Step 2's
 * real Job Category dropdown uses) and only uses the id if a match is
 * found. Built from this project's actual seeded category set (verified
 * against gethired.category), not invented -- an environment with a
 * different category taxonomy simply won't match anything here, which is
 * the safe failure mode (leaves Job Category unselected), not a wrong
 * guess.
 *
 * Deliberately conservative: a handful of real seeded roles (Project
 * Manager, Business Analyst) are NOT included below because they don't map
 * cleanly to one category over another -- see TAB04's "otherwise leave
 * unselected" rule. Never fuzzy-matches; a title with no matching keyword
 * returns null.
 */

interface CategoryKeywordGroup {
  categoryName: string;
  keywords: string[];
}

const KEYWORD_GROUPS: CategoryKeywordGroup[] = [
  {
    categoryName: 'Software Development',
    keywords: [
      'software engineer', 'software developer', 'developer', 'programmer',
      'frontend developer', 'front-end developer', 'backend developer', 'back-end developer',
      'full stack', 'fullstack', 'mobile developer', 'devops', 'devops engineer',
      'qa engineer', 'quality assurance engineer', 'web developer',
    ],
  },
  {
    categoryName: 'Data & Analytics',
    keywords: ['data analyst', 'data scientist', 'data engineer'],
  },
  {
    categoryName: 'Design',
    keywords: ['ui/ux designer', 'ux designer', 'ui designer', 'graphic designer', 'product designer'],
  },
  {
    categoryName: 'Product Management',
    keywords: ['product manager', 'product owner'],
  },
  {
    categoryName: 'Sales',
    keywords: ['sales representative', 'sales rep', 'account executive', 'sales associate', 'sales manager'],
  },
  {
    categoryName: 'Marketing',
    keywords: ['marketing specialist', 'digital marketing', 'marketing manager', 'seo specialist', 'content marketing'],
  },
  {
    categoryName: 'Customer Support',
    keywords: ['customer support', 'customer success', 'customer service representative'],
  },
  {
    categoryName: 'Human Resources',
    keywords: ['hr generalist', 'human resources', 'recruiter', 'talent acquisition'],
  },
  {
    categoryName: 'Finance & Accounting',
    keywords: ['accountant', 'financial analyst', 'bookkeeper', 'auditor', 'finance manager'],
  },
  {
    categoryName: 'Operations',
    keywords: ['operations manager', 'operations associate', 'logistics coordinator'],
  },
  {
    categoryName: 'IT & Administration',
    keywords: ['administrative assistant', 'office administrator', 'it support', 'system administrator', 'network administrator'],
  },
  {
    categoryName: 'Legal',
    keywords: ['legal counsel', 'lawyer', 'attorney', 'paralegal'],
  },
  {
    categoryName: 'Healthcare',
    keywords: ['registered nurse', 'nurse', 'physician', 'doctor', 'medical assistant', 'caregiver'],
  },
  {
    categoryName: 'Education',
    keywords: ['teacher', 'instructor', 'professor', 'tutor'],
  },
];

function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

/** Returns a suggested Job Category NAME, or null if the title doesn't
 *  contain a strong-enough, unambiguous signal. Never throws. */
export function suggestCategoryName(jobTitle: string | null | undefined): string | null {
  if (!jobTitle) return null;
  const t = normalize(jobTitle);
  if (!t) return null;

  for (const group of KEYWORD_GROUPS) {
    if (group.keywords.some((k) => t.includes(k))) {
      return group.categoryName;
    }
  }
  return null;
}
