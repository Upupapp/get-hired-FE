/**
 * B13 — JobReadinessBarComponent
 *
 * Shows readiness level label, animated progress bar, and summary copy.
 * Receives a JobReadinessResult from the parent (no internal computation).
 *
 * ARIA: role="progressbar" with aria-valuemin/max/now/label.
 * Reduced-motion: bar fill transition and glow animation are disabled via
 * _motion.scss's prefers-reduced-motion guard.
 */
import {
  Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy
} from '@angular/core';
import { JobReadinessResult, JobReadinessLevel } from '../../services/job-readiness.service';

@Component({
  selector: 'app-job-readiness-bar',
  templateUrl: './job-readiness-bar.component.html',
  styleUrls: ['./job-readiness-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobReadinessBarComponent implements OnChanges {
  @Input() result: JobReadinessResult | null = null;

  /** Used to trigger one-shot glow on level change */
  glowActive = false;
  private _prevLevel: JobReadinessLevel | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.result && this.result) {
      const newLevel = this.result.readinessLevel;
      if (newLevel !== this._prevLevel) {
        this.glowActive = false;
        // Allow one frame to reset so animation re-fires
        setTimeout(() => { this.glowActive = true; }, 0);
        this._prevLevel = newLevel;
      }
    }
  }

  get levelClass(): string {
    if (!this.result) return 'jrb-level--draft';
    switch (this.result.readinessLevel) {
      case 'draft':      return 'jrb-level--draft';
      case 'basic':      return 'jrb-level--basic';
      case 'strong':     return 'jrb-level--strong';
      case 'excellent':  return 'jrb-level--excellent';
    }
  }

  get levelLabel(): string {
    if (!this.result) return 'Required fields missing';
    switch (this.result.readinessLevel) {
      case 'draft':      return 'Required fields missing';
      case 'basic':      return 'Needs improvement';
      case 'strong':     return 'Strong';
      case 'excellent':  return 'Excellent';
    }
  }

  get sublabel(): string {
    if (!this.result) return '';
    const r = this.result;
    if (!r.canPublish) {
      return `${r.blockingItems.length} required field${r.blockingItems.length !== 1 ? 's' : ''} missing`;
    }
    if (r.recommendationItems.length === 0) {
      return 'All sections complete';
    }
    return `${r.recommendedComplete} of ${r.recommendedTotal} recommended sections complete`;
  }
}
