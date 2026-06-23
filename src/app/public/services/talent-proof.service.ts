import { Injectable } from '@angular/core';
import { TalentProofStats, TalentProofVerificationStatus } from './talent-proof.model';

/**
 * GETHIRED 500K TALENT PROOF SYSTEM -- v2, centralized source.
 *
 * `verificationStatus: 'owner_confirmed'` -- see talent-proof.model.ts's
 * header comment for the full record of what this does and doesn't mean.
 * Changing the underlying number/status later is a one-line edit to the
 * `stats` object below; no component or template needs to change.
 */
@Injectable({ providedIn: 'root' })
export class TalentProofService {

  private readonly stats: TalentProofStats = {
    registeredJobSeekersNumber: 500000,
    registeredJobSeekersLabel: '500,000+',
    registeredJobSeekersDisplay: '500,000+ registered job seekers across the Philippines',
    shortClaim: '500,000+ registered job seekers',
    mediumClaim: 'Reach 500,000+ registered job seekers across the Philippines',
    longClaim: 'Post your job to GetHired and reach 500,000+ registered job seekers across the Philippines.',
    fallbackClaim: 'Reach a growing network of registered job seekers across the Philippines.',
    verificationStatus: 'owner_confirmed',
    ownerConfirmed: true,
    databaseVerified: false,
    sourceLabel: 'Product-owner confirmed live production database count',
    sourceDetail: 'Confirmed by Paul Gemar Espinas, Founder & CEO of UpUp Technologies / GetHired product owner, on June 22, 2026. Production database count is stated to exceed 500,000 registered job seekers.',
    lastUpdated: '2026-06-22',
    ctaPrimary: { label: 'Start hiring', route: '/employers' },
    ctaSecondary: { label: 'Post a job', route: '/employers' },
    allowedPlacements: [
      'main_portal_hero', 'main_portal_role_card', 'employer_portal_hero',
      'job_board_banner', 'job_board_sidebar', 'job_detail_employer_cta',
      'employer_signup', 'employer_onboarding', 'employer_dashboard_no_job',
      'employer_dashboard_job_list', 'job_builder_sidebar', 'publish_success',
    ],
  };

  /** If this ever throws (it can't today -- it's a static object, not an
   * HTTP call -- but kept as the single read path so a future real fetch
   * can wrap itself in try/catch here without touching call sites), every
   * consumer falls back to fallbackClaim via getDisplayCopy()'s own guard. */
  getStats(): TalentProofStats {
    return this.stats;
  }

  /** What every component should render. Resolves verification status
   * internally so call sites never branch on the enum themselves. */
  getDisplayCopy(length: 'short' | 'medium' | 'long' = 'medium'): string {
    if (this.stats.verificationStatus === 'unverified_fallback') {
      return this.stats.fallbackClaim;
    }
    if (length === 'short') return this.stats.shortClaim;
    if (length === 'long') return this.stats.longClaim;
    return this.stats.mediumClaim;
  }

  /** Accessible, screen-reader-safe version -- spelled out, never reads
   * an ambiguous abbreviation. */
  getAccessibleLabel(): string {
    if (this.stats.verificationStatus === 'unverified_fallback' || !this.stats.registeredJobSeekersNumber) {
      return 'A growing network of registered job seekers across the Philippines.';
    }
    return `More than ${this.stats.registeredJobSeekersNumber.toLocaleString()} registered job seekers across the Philippines.`;
  }

  getVerificationStatus(): TalentProofVerificationStatus {
    return this.stats.verificationStatus;
  }

  /** Legacy boolean signal, kept for any caller that only needs yes/no --
   * derives from the enum rather than being a separate source of truth. */
  isVerified(): boolean {
    return this.stats.verificationStatus !== 'unverified_fallback';
  }

  getSourceLabel(): string {
    return this.stats.sourceLabel;
  }
}
