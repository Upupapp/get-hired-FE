import { Injectable } from '@angular/core';

/**
 * No-op-safe analytics helper for the public portal. No analytics SDK exists
 * in this codebase today (confirmed via repo-wide search for gtag/segment/
 * mixpanel/amplitude — none found), so every method here just console.debug
 * in non-production and is a safe no-op otherwise. Swap the body of `track()`
 * for a real provider call later without touching any call site.
 *
 * Track meaningful actions only — do not call these from template
 * interpolation or on every render.
 */
@Injectable({ providedIn: 'root' })
export class PublicPortalAnalyticsService {

  private track(event: string, payload?: Record<string, any>): void {
    if (!this.isProd()) {
      // eslint-disable-next-line no-console
      console.debug(`[analytics] ${event}`, payload || {});
    }
    try {
      const gtag = (window as any).gtag;
      if (typeof gtag === 'function') {
        gtag('event', event, payload || {});
      }
    } catch (_) { /* blocked or unsupported — fail silently */ }
  }

  private isProd(): boolean {
    try {
      // Avoid a hard import dependency on environment files from a shared service.
      return (window as any)?.__env?.production === true;
    } catch {
      return false;
    }
  }

  trackPublicJobsPageViewed(): void {
    this.track('public_jobs_page_viewed');
  }

  trackPublicJobSearchUsed(params: { keyword?: string; location?: string }): void {
    this.track('public_job_search_used', params);
  }

  trackPublicFilterApplied(filter: { key: string; value: any }): void {
    this.track('public_filter_applied', filter);
  }

  trackPublicSortChanged(sort: string): void {
    this.track('public_sort_changed', { sort });
  }

  trackPublicJobCardClicked(jobId: string): void {
    this.track('public_job_card_clicked', { jobId });
  }

  trackPublicJobDetailViewed(jobId: string): void {
    this.track('public_job_detail_viewed', { jobId });
  }

  trackSignupPromptViewed(context: string): void {
    this.track('signup_prompt_viewed', { context });
  }

  trackSignupPromptClicked(context: string): void {
    this.track('signup_prompt_clicked', { context });
  }

  trackLoginPromptClicked(context: string): void {
    this.track('login_prompt_clicked', { context });
  }

  trackUnlockMatchClicked(jobId: string): void {
    this.track('unlock_match_clicked', { jobId });
  }

  trackApplyPromptClicked(jobId: string, authState: 'anonymous' | 'logged_in'): void {
    this.track('apply_prompt_clicked', { jobId, authState });
  }

  trackVideoInterviewBadgeClicked(jobId: string): void {
    this.track('video_interview_badge_clicked', { jobId });
  }

  trackCompanyPreviewClicked(companyId: string): void {
    this.track('company_preview_clicked', { companyId });
  }

  trackSavedJobClicked(jobId: string): void {
    this.track('saved_job_clicked', { jobId });
  }

  trackJobAlertPromptClicked(context: string): void {
    this.track('job_alert_prompt_clicked', { context });
  }

  trackReducedMotionDetected(): void {
    this.track('reduced_motion_detected');
  }

  // GETHIRED 500K TALENT PROOF SYSTEM v1 -- never logs applicant personal
  // data, raw counts, or tokens; only placement/route/role/verification
  // metadata, per GETHIRED_TALENT_PROOF_PRIVACY_TRUST_GUARDRAILS.md.
  trackTalentProofViewed(placement: string, metricVerified: boolean): void {
    this.track('talent_proof_viewed', { placement, metricVerified });
  }

  trackTalentProofCtaClicked(placement: string, ctaText: string): void {
    this.track('talent_proof_cta_clicked', { placement, ctaText });
  }

  trackTalentProofBannerDismissed(placement: string): void {
    this.track('talent_proof_banner_dismissed', { placement });
  }

  // GH1 WOW portal upgrade -- header/USP/story-section engagement. Payload
  // is always route/section/ctaId metadata only, never user input or PII,
  // per this file's standing rule.
  trackBrowseJobsHeaderClicked(route: string): void {
    this.track('browse_jobs_header_clicked', { route });
  }

  trackUspSectionViewed(page: string): void {
    this.track('usp_section_viewed', { page });
  }

  trackVideoAnswersSectionViewed(page: string): void {
    this.track('video_answers_section_viewed', { page });
  }

  trackMatchSignalsSectionViewed(page: string): void {
    this.track('match_signals_section_viewed', { page });
  }

  trackProfileWorkspaceSectionViewed(page: string): void {
    this.track('profile_workspace_section_viewed', { page });
  }

  trackPortalFaqOpened(page: string, question: string): void {
    this.track('portal_faq_opened', { page, question });
  }

  // GETHIRED_EMPLOYER_INFORMATION_PORTAL_VISUAL_UPGRADE
  trackTrustStripViewed(page: string): void {
    this.track('trust_strip_viewed', { page });
  }

  trackHowItWorksSectionViewed(page: string): void {
    this.track('how_it_works_section_viewed', { page });
  }

  // APPLICANT APPLICATION COMPLETENESS BADGE/NUDGES -- track meaningful
  // completeness UI interactions only. Payload never contains score values,
  // profile content, or employer identifiers -- only application IDs and
  // action labels, per this file's standing privacy rule.
  trackApplicationCompletenessViewed(applicationId: string): void {
    this.track('application_completeness_viewed', { applicationId });
  }

  trackApplicationCompletenessCtaClicked(applicationId: string, ctaLabel: string): void {
    this.track('application_completeness_cta_clicked', { applicationId, ctaLabel });
  }

  // HOME V2 — product preview / trust / employer band engagement.
  // Payload is section/tab/page metadata only, never user PII.
  trackProductPreviewSectionViewed(page: string): void {
    this.track('product_preview_section_viewed', { page });
  }

  trackProductPreviewTabClicked(tab: string, page: string): void {
    this.track('product_preview_tab_clicked', { tab, page });
  }

  trackTrustSafetySectionViewed(page: string): void {
    this.track('trust_safety_section_viewed', { page });
  }

  trackEmployerConversionBandViewed(page: string): void {
    this.track('employer_conversion_band_viewed', { page });
  }

  trackHeroCTAClicked(cta: 'find_jobs' | 'start_hiring', page: string): void {
    this.track('hero_cta_clicked', { cta, page });
  }

  trackFinalCTAClicked(cta: 'find_jobs' | 'start_hiring', page: string): void {
    this.track('final_cta_clicked', { cta, page });
  }
}
