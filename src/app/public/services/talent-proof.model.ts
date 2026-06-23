/**
 * GETHIRED 500K TALENT PROOF SYSTEM -- v2 (owner-confirmed expansion).
 *
 * VERIFICATION STATUS HISTORY:
 * - v1 (prior pass): `registeredJobSeekersVerified: false`. A repo-wide
 *   search found zero internal source for "500,000" anywhere in code,
 *   reports, or config. Fallback copy was used everywhere.
 * - v2 (this pass): the product owner (Paul Gemar Espinas, Founder & CEO
 *   of UpUp Technologies / GetHired product owner) explicitly confirmed,
 *   on 2026-06-22, that GetHired's live production database has over
 *   500,000 registered job seekers. This is a business-fact confirmation
 *   from the person with actual authority and access to make that claim
 *   -- it is NOT a Claude-performed database verification. No production
 *   query, export, or source artifact was provided or run this pass; the
 *   `databaseVerified` flag stays `false` until one is. The distinction
 *   between `ownerConfirmed` and `databaseVerified` exists specifically
 *   so no component or report can later imply Claude verified the
 *   production count independently when it did not.
 *
 * `verificationStatus` replaces the old boolean `verified` flag with a
 * 3-state enum, exactly per this command's required model. The legacy
 * boolean getter (`isVerified()`) is kept on the service for any caller
 * that only needs a yes/no signal, but now derives from the enum rather
 * than being its own source of truth.
 */
export type TalentProofVerificationStatus = 'owner_confirmed' | 'database_verified' | 'unverified_fallback';

export interface TalentProofCta {
  label: string;
  route: string;
}

export interface TalentProofStats {
  registeredJobSeekersNumber: number | null;
  registeredJobSeekersLabel: string;
  registeredJobSeekersDisplay: string;
  shortClaim: string;
  mediumClaim: string;
  longClaim: string;
  fallbackClaim: string;
  verificationStatus: TalentProofVerificationStatus;
  ownerConfirmed: boolean;
  databaseVerified: boolean;
  sourceLabel: string;
  sourceDetail: string;
  lastUpdated: string;
  ctaPrimary: TalentProofCta;
  ctaSecondary: TalentProofCta;
  allowedPlacements: TalentProofPlacement[];
}

export type TalentProofPlacement =
  | 'main_portal_hero'
  | 'main_portal_role_card'
  | 'employer_portal_hero'
  | 'job_board_banner'
  | 'job_board_sidebar'
  | 'job_detail_employer_cta'
  | 'employer_signup'
  | 'employer_onboarding'
  | 'employer_dashboard_no_job'
  | 'employer_dashboard_job_list'
  | 'job_builder_sidebar'
  | 'publish_success';

export type TalentProofVariant = 'pill' | 'card' | 'strip' | 'banner';
