import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ADMIN_TIME_PRESETS,
  AdminRangePreset,
  AdminTimeRange,
  resolvePreset,
  validateCustomRange,
} from '../admin-time';

@Component({
  selector: 'app-admin-time-filter',
  templateUrl: './admin-time-filter.component.html',
  styleUrls: ['./admin-time-filter.component.scss']
})
export class AdminTimeFilterComponent {
  readonly presets = ADMIN_TIME_PRESETS;

  @Input() updating = false;
  /** When true, no preset is shown as pressed. Used by All history beside this control. */
  @Input() inactive = false;
  @Output() rangeChange = new EventEmitter<AdminTimeRange>();

  committed: AdminTimeRange = resolvePreset('7d');
  draftFrom = this.committed.from;
  draftTo = this.committed.to;

  @Input() set range(value: AdminTimeRange) {
    this.committed = value || resolvePreset('7d');
    this.draftFrom = this.committed.from || '';
    this.draftTo = this.committed.to || '';
  }

  get range(): AdminTimeRange {
    return this.committed;
  }

  get rangeError(): string {
    return this.committed.preset === 'custom' ? (this.committed.invalid || '') : '';
  }

  pressed(preset: AdminRangePreset): boolean {
    return !this.inactive && this.committed.preset === preset;
  }

  select(preset: AdminRangePreset): void {
    if (preset === 'custom') {
      const from = this.committed.from;
      const to = this.committed.to;
      this.rangeChange.emit({
        preset: 'custom',
        from,
        to,
        invalid: validateCustomRange(from, to),
      });
      return;
    }
    this.rangeChange.emit(resolvePreset(preset));
  }

  onFrom(value: string): void {
    this.draftFrom = value;
    this.emitCustom();
  }

  onTo(value: string): void {
    this.draftTo = value;
    this.emitCustom();
  }

  applyCustom(): void {
    this.emitCustom();
  }

  private emitCustom(): void {
    this.rangeChange.emit({
      preset: 'custom',
      from: this.draftFrom,
      to: this.draftTo,
      invalid: validateCustomRange(this.draftFrom, this.draftTo),
    });
  }
}
