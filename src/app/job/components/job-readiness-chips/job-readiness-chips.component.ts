/**
 * B13 — JobReadinessChipsComponent
 *
 * Renders blocking / recommended / complete / optional chip rows.
 * Chips:
 *   - Blocking (red/attention): jump to section on click + one-shot shake nudge
 *   - Recommended (amber): jump to section on click
 *   - Complete (green): confirm section is done
 *   - Optional (grey): explain what's optional for publishing
 *
 * Accessibility:
 *   - All chips are <button> elements, keyboard accessible via Tab/Enter/Space
 *   - Not color-only: icon + text + role="status" for complete chips
 *   - Blocking chips have aria-label explaining the issue
 *
 * Reduced-motion:
 *   - Shake nudge: @media (prefers-reduced-motion: reduce) { animation: none }
 *   - Enter transition: same guard
 *   - Hover scale: same guard
 */
import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { JobReadinessItem, JobReadinessResult } from '../../services/job-readiness.service';

@Component({
  selector: 'app-job-readiness-chips',
  templateUrl: './job-readiness-chips.component.html',
  styleUrls: ['./job-readiness-chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobReadinessChipsComponent {
  @Input() result: JobReadinessResult | null = null;

  /** Emitted with a sectionId when the user clicks a chip */
  @Output() jumpToSection = new EventEmitter<string>();

  onChipClick(item: JobReadinessItem): void {
    if (item.sectionId) {
      this.jumpToSection.emit(item.sectionId);
      // Smooth-scroll to the section anchor in the form
      const el = document.getElementById(item.sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Focus the element so keyboard users land somewhere meaningful
        el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      }
    }
  }

  /** Track by key for ngFor performance */
  trackByKey(_: number, item: JobReadinessItem): string {
    return item.key;
  }
}
