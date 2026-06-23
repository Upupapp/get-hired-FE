import { Component, Input, OnInit } from '@angular/core';
import { TalentProofService } from '@main/public/services/talent-proof.service';
import { PublicPortalAnalyticsService } from '@main/public/services/public-portal-analytics.service';

/**
 * GETHIRED 500K TALENT PROOF SYSTEM v1 -- reusable proof component.
 *
 * Consolidates the registered spec's separate TalentProofBadge/Strip/
 * StatCard component ideas into one component with a `variant` input,
 * since all three are the same underlying data (TalentProofService's
 * display copy) rendered at different sizes -- a pragmatic reduction
 * from 3+ near-duplicate components to one, consistent with this
 * session's standing "no premature abstraction" discipline.
 *
 * Always renders real, accessible text (never an image-only stat, never
 * an animated count-up that's required to understand the number) -- see
 * GETHIRED_TALENT_PROOF_ACCESSIBILITY_MOBILE_SPEC.md.
 */
@Component({
  selector: 'app-talent-proof-badge',
  templateUrl: './talent-proof-badge.component.html',
  styleUrls: ['./talent-proof-badge.component.scss'],
})
export class TalentProofBadgeComponent implements OnInit {
  /** pill: small inline badge (role cards, sticky mobile CTA)
   *  card: larger standalone card (employer hero, onboarding)
   *  strip: full-width band (trust strip, job board banner content) */
  @Input() variant: 'pill' | 'card' | 'strip' = 'pill';
  /** Used only for analytics -- which screen/section this instance lives in. */
  @Input() placement: string = 'unspecified';

  displayCopy = '';
  accessibleLabel = '';
  verified = false;

  constructor(
    private talentProof: TalentProofService,
    private analytics: PublicPortalAnalyticsService,
  ) {}

  ngOnInit(): void {
    const length = this.variant === 'pill' ? 'short' : this.variant === 'strip' ? 'long' : 'medium';
    this.displayCopy = this.talentProof.getDisplayCopy(length);
    this.accessibleLabel = this.talentProof.getAccessibleLabel();
    this.verified = this.talentProof.isVerified();
    this.analytics.trackTalentProofViewed(this.placement, this.verified);
  }
}
