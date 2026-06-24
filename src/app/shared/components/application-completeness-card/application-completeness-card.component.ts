import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * ApplicationCompletenessCardComponent
 *
 * Full-detail card showing an applicant's application completeness snapshot.
 * Used in the applicant-applications list as an expandable detail section.
 *
 * Inputs:
 *   snapshot    — the snapshot object from the batch endpoint (or null)
 *   loading     — true while batch request is in-flight
 *   error       — true if the snapshot request errored
 *   retryClick  — emitted when user clicks "Try again" in the error state
 *
 * States handled:
 *   1. loading         — skeleton shimmer (label + badge + progress bar)
 *   2. error           — error block with retry button
 *   3. null snapshot   — soft unavailable (batch fetch returned no entry)
 *   4. !hasSnapshot    — pre-deployment application note
 *   5. hasSnapshot     — full score + tips + positive state + disclaimer
 *
 * Accessibility:
 *   - role="region" with descriptive aria-label on outer container
 *   - role="status" + aria-live="polite" on loading skeleton
 *   - role="progressbar" + aria-valuenow/min/max on progress bar
 *   - All tip lists are <ul> with semantic headings
 *   - CTA has :focus-visible ring
 *
 * Safety constraints:
 *   - No employer data displayed
 *   - No hiring-decision language
 *   - No cross-applicant data
 *   - Disclaimer always shown when score is present
 */
@Component({
  selector: 'app-application-completeness-card',
  templateUrl: './application-completeness-card.component.html',
  styleUrls: ['./application-completeness-card.component.scss'],
})
export class ApplicationCompletenessCardComponent {
  @Input() snapshot: any = null;
  @Input() loading: boolean = false;
  @Input() error: boolean = false;
  @Output() retryClick = new EventEmitter<void>();

  onRetry(): void {
    this.retryClick.emit();
  }

  /** Display label for the completeness level */
  get displayLevel(): string {
    const level = this.snapshot?.completenessLevel;
    if (!level) return '';
    if (level === 'incomplete') return 'Getting started';
    return level.charAt(0).toUpperCase() + level.slice(1);
  }

  /** CSS modifier class for the progress bar fill color */
  get progressLevelClass(): string {
    const level = this.snapshot?.completenessLevel;
    if (!level) return 'acdc-progress--unavailable';
    return `acdc-progress--${level}`;
  }

  /** True when there are no missing required or recommended items */
  get isComplete(): boolean {
    if (!this.snapshot?.hasSnapshot) return false;
    const noRequired = !this.snapshot.missingRequired?.length;
    const noRecommended = !this.snapshot.missingRecommended?.length;
    return noRequired && noRecommended;
  }

  /** trackBy for tip lists — avoids full list re-render on identity change */
  trackByReason(_index: number, tip: any): string {
    return tip?.reason ?? String(_index);
  }

  /**
   * Map a missing-field reason string to the profile section name for display.
   * All CTAs point to /user/profile/edit (no deep-links exist in current routing).
   */
  sectionLabel(reason: string): string {
    const r = (reason ?? '').toLowerCase();
    if (r.includes('work experience') || r.includes('experience')) return 'Work Experience';
    if (r.includes('education')) return 'Education';
    if (r.includes('skill')) return 'Skills';
    if (r.includes('photo')) return 'Profile Photo';
    if (r.includes('resume') || r.includes('cv')) return 'Resume/CV';
    if (r.includes('summary') || r.includes('bio')) return 'Professional Summary';
    if (r.includes('contact')) return 'Contact Info';
    return 'Your Profile';
  }
}
