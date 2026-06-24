import { Component, Input } from '@angular/core';

/**
 * ApplicationCompletenessBadgeComponent
 *
 * Compact pill badge for displaying an applicant's application completeness
 * level and score. Used in the applicant-applications list row (compact) and
 * as the header of the detail card.
 *
 * Inputs:
 *   level   — 'excellent' | 'strong' | 'basic' | 'incomplete' | null
 *   score   — 0–100 integer or null
 *   loading — true while the batch snapshot request is in-flight
 *   compact — always true for current usage; retained for future size variants
 *
 * Accessibility:
 *   - aria-label on host gives screen readers the full "Application completeness:
 *     Strong, 82 percent" label without requiring them to read the visual text
 *   - role="status" on the loading skeleton announces "Loading completeness"
 *   - Text is never color-only: the label always accompanies the color pill
 *
 * Animation:
 *   - Loading skeleton uses @keyframes acb-shimmer (ambient, removed under
 *     prefers-reduced-motion via @include ambient-motion-safe)
 *   - Reveal uses @keyframes acb-fadein (transition, suppressed under
 *     prefers-reduced-motion via @include motion-safe)
 *
 * Safety constraints:
 *   - Does NOT show employer data
 *   - Does NOT use hiring-decision language
 *   - Does NOT affect application submission
 */
@Component({
  selector: 'app-application-completeness-badge',
  templateUrl: './application-completeness-badge.component.html',
  styleUrls: ['./application-completeness-badge.component.scss'],
})
export class ApplicationCompletenessBadgeComponent {
  @Input() level: string | null = null;
  @Input() score: number | null = null;
  @Input() loading: boolean = false;
  @Input() compact: boolean = true;

  /** Display label: 'incomplete' → 'Getting started', others → titlecase */
  get displayLevel(): string {
    if (!this.level) return '';
    if (this.level === 'incomplete') return 'Getting started';
    return this.level.charAt(0).toUpperCase() + this.level.slice(1);
  }

  /** CSS modifier class based on level */
  get levelClass(): string {
    if (!this.level) return 'acb-level--unavailable';
    return `acb-level--${this.level}`;
  }

  /** Accessible label for aria-label attribute */
  get accessibleLabel(): string {
    if (this.loading) return 'Loading application completeness';
    if (!this.level && this.score === null) return 'Application completeness: unavailable';
    const level = this.displayLevel;
    const score = this.score !== null ? `, ${this.score} percent` : '';
    return `Application completeness: ${level}${score}`;
  }
}
