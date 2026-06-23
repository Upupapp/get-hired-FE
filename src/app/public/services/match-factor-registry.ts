import { MatchFactorCategory, MatchFactorImportance } from './match-factor.model';

/**
 * GetHired MATCH FACTORS v2/v3 -- factor registry.
 *
 * Covers only the factor codes GetHired can actually back with real data
 * today (33 entries as of the v3 addendum's QA sweep -- corrected from
 * earlier passes' "~25" estimate, which undercounted by not including
 * the 8 job_matchability entries already present since v2). The
 * remaining sub-factor codes (license, tool_software, availability,
 * language, certification *requirement matching* as opposed to presence,
 * experience richness beyond level) are documented in
 * GETHIRED_MATCH_FACTOR_REGISTRY.md / GETHIRED_MATCH_FACTOR_ADVANCED_REGISTRY.md
 * as specified-but-not-yet-backed -- not stubbed here with fake entries,
 * consistent with this session's standing "no fake evidence" rule.
 */

export interface MatchFactorRegistryEntry {
  factorCode: string;
  category: MatchFactorCategory;
  importance: MatchFactorImportance;
  label: string;
  shortLabel: string;
}

export const matchFactorRegistry: MatchFactorRegistryEntry[] = [
  // Group 1 -- Required Skill
  { factorCode: 'required_skill_exact_match', category: 'required_skill', importance: 'critical', label: 'Required skill found', shortLabel: 'Skill matched' },
  { factorCode: 'required_skill_alias_match', category: 'required_skill', importance: 'critical', label: 'Required skill found through related wording', shortLabel: 'Skill matched (alias)' },
  { factorCode: 'required_skill_missing', category: 'required_skill', importance: 'critical', label: 'Required skill not found yet', shortLabel: 'Skill missing' },

  // Group 2 -- Preferred Skill
  { factorCode: 'preferred_skill_exact_match', category: 'preferred_skill', importance: 'medium', label: 'Preferred skill found', shortLabel: 'Preferred skill matched' },
  { factorCode: 'preferred_skill_alias_match', category: 'preferred_skill', importance: 'medium', label: 'Preferred skill found through related wording', shortLabel: 'Preferred skill matched (alias)' },
  { factorCode: 'preferred_skill_missing', category: 'preferred_skill', importance: 'low', label: 'Preferred skill not found yet', shortLabel: 'Preferred skill missing' },

  // Group 5 -- Role/Title
  { factorCode: 'role_title_exact_match', category: 'role_title', importance: 'high', label: 'Role title matches', shortLabel: 'Title matched' },
  { factorCode: 'role_title_missing', category: 'role_title', importance: 'medium', label: 'Role title match not found', shortLabel: 'Title not matched' },

  // Group 6 -- Industry (always inapplicable today -- no data field)
  { factorCode: 'industry_missing', category: 'industry_domain', importance: 'low', label: 'Industry preference not specified', shortLabel: 'Industry not specified' },

  // Group 4 -- Experience (level only, not full richness)
  { factorCode: 'experience_seniority_match', category: 'experience', importance: 'high', label: 'Experience level aligns with the role', shortLabel: 'Level matched' },
  { factorCode: 'experience_missing', category: 'experience', importance: 'medium', label: 'Experience level not specified or does not align', shortLabel: 'Level not matched' },

  // Group 7 -- Location/Work Setup
  { factorCode: 'work_setup_match', category: 'work_setup', importance: 'high', label: 'Preferred work setup matches', shortLabel: 'Work setup matched' },
  { factorCode: 'work_setup_conflict', category: 'work_setup', importance: 'medium', label: 'Work setup preference may not match', shortLabel: 'Work setup mismatch' },

  // Group 9 -- Salary
  { factorCode: 'salary_range_overlap', category: 'salary_preference', importance: 'low', label: 'Salary expectation appears aligned', shortLabel: 'Salary aligned' },
  { factorCode: 'salary_range_conflict', category: 'salary_preference', importance: 'low', label: 'Salary expectation may not align', shortLabel: 'Salary mismatch' },

  // Group 10 -- Education
  { factorCode: 'education_field_match', category: 'education', importance: 'medium', label: 'Relevant field of study found', shortLabel: 'Education matched' },
  { factorCode: 'education_unclear', category: 'education', importance: 'low', label: 'Education evidence unclear', shortLabel: 'Education unclear' },

  // Group 16 -- Job Matchability
  { factorCode: 'job_title_clear', category: 'job_matchability', importance: 'medium', label: 'Job title is clear', shortLabel: 'Title clear' },
  { factorCode: 'job_title_unclear', category: 'job_matchability', importance: 'medium', label: 'Job title needs more detail', shortLabel: 'Title unclear' },
  { factorCode: 'job_responsibilities_clear', category: 'job_matchability', importance: 'medium', label: 'Responsibilities are clear', shortLabel: 'Responsibilities clear' },
  { factorCode: 'job_responsibilities_missing', category: 'job_matchability', importance: 'medium', label: 'Responsibilities missing', shortLabel: 'Responsibilities missing' },
  { factorCode: 'job_required_skills_clear', category: 'job_matchability', importance: 'high', label: 'Required skills are clear', shortLabel: 'Required skills clear' },
  { factorCode: 'job_required_skills_missing', category: 'job_matchability', importance: 'high', label: 'Required skills missing', shortLabel: 'Required skills missing' },
  { factorCode: 'job_required_preferred_separated', category: 'job_matchability', importance: 'low', label: 'Required and preferred skills are separated', shortLabel: 'Skills separated' },
  { factorCode: 'job_required_preferred_mixed', category: 'job_matchability', importance: 'low', label: 'Required and preferred skills need separation', shortLabel: 'Skills not separated' },

  // Group 11 -- Certification (v3 addendum: presence-only, see
  // GETHIRED_MATCH_FACTOR_ADVANCED_REGISTRY.md -- no job-side requirement
  // field exists to match against, so this is evidence-only, weight 0,
  // never affects score or the legacy matchedFactors/missingFactors arrays).
  { factorCode: 'certification_on_file', category: 'certification', importance: 'low', label: 'Certifications on file', shortLabel: 'Certifications on file' },

  // Group 17 -- Data Quality / Confidence
  { factorCode: 'data_quality_high', category: 'data_quality', importance: 'low', label: 'Strong data available', shortLabel: 'Strong data' },
  { factorCode: 'data_quality_low', category: 'data_quality', importance: 'low', label: 'Limited data available', shortLabel: 'Limited data' },

  // Group 18 -- Safety / Data Not Used (always emitted, never conditional)
  { factorCode: 'not_used_protected_attributes', category: 'safety_not_used', importance: 'low', label: 'Protected attributes were not used', shortLabel: 'No protected attributes' },
  { factorCode: 'not_used_photo', category: 'safety_not_used', importance: 'low', label: 'Photo appearance was not used', shortLabel: 'No photo scoring' },
  { factorCode: 'not_used_video_traits', category: 'safety_not_used', importance: 'low', label: 'Video traits were not used', shortLabel: 'No video trait scoring' },
  { factorCode: 'not_used_school_prestige', category: 'safety_not_used', importance: 'low', label: 'School prestige was not used', shortLabel: 'No school prestige scoring' },
  { factorCode: 'not_used_exact_address', category: 'safety_not_used', importance: 'low', label: 'Exact address was not used', shortLabel: 'No exact address scoring' },
];

export function findFactorRegistryEntry(factorCode: string): MatchFactorRegistryEntry | undefined {
  return matchFactorRegistry.find(e => e.factorCode === factorCode);
}
