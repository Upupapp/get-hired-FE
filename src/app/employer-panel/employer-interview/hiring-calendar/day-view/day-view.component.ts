import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ScheduledInterview } from '@app-shared/interview-scheduling/interview-scheduling.models';
import {
  CalendarEventItem,
  dateKey,
  LaidOutEvent,
  layoutOverlappingEvents,
} from '@app-shared/interview-scheduling/calendar.utils';

const DEFAULT_START_HOUR = 6;
const DEFAULT_END_HOUR = 21; // 9 PM

/**
 * Single-day time-grid view. Visible hour window defaults to 6am-9pm but
 * auto-extends to include any event outside that range -- interviews are
 * never hidden because they fall outside a "business hours" default.
 */
@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss'],
})
export class DayViewComponent implements OnChanges {
  @Input() date!: Date;
  @Input() bucketedByDay!: Map<string, CalendarEventItem[]>;
  @Input() displayTimeZone!: string;
  @Output() eventActivated = new EventEmitter<ScheduledInterview>();

  hours: number[] = [];
  laidOutEvents: LaidOutEvent[] = [];
  windowStartMinutes = DEFAULT_START_HOUR * 60;
  windowEndMinutes = DEFAULT_END_HOUR * 60;

  ngOnChanges(): void {
    const events = this.bucketedByDay?.get(dateKey(this.date)) || [];

    let startHour = DEFAULT_START_HOUR;
    let endHour = DEFAULT_END_HOUR;
    for (const ev of events) {
      startHour = Math.min(startHour, Math.floor(ev.startMinutes / 60));
      endHour = Math.max(endHour, Math.ceil(ev.endMinutes / 60));
    }
    this.windowStartMinutes = startHour * 60;
    this.windowEndMinutes = endHour * 60;

    this.hours = [];
    for (let h = startHour; h < endHour; h++) { this.hours.push(h); }

    this.laidOutEvents = layoutOverlappingEvents(events);
  }

  get totalWindowMinutes(): number {
    return Math.max(1, this.windowEndMinutes - this.windowStartMinutes);
  }

  topPct(item: CalendarEventItem): number {
    return ((item.startMinutes - this.windowStartMinutes) / this.totalWindowMinutes) * 100;
  }

  heightPct(item: CalendarEventItem): number {
    const raw = ((item.endMinutes - item.startMinutes) / this.totalWindowMinutes) * 100;
    return Math.max(raw, 2.5);
  }

  leftPct(laid: LaidOutEvent): number {
    return (laid.column / laid.columnCount) * 100;
  }

  widthPct(laid: LaidOutEvent): number {
    return 100 / laid.columnCount;
  }

  hourLabel(hour: number): string {
    const h = hour % 24;
    const period = h < 12 ? 'AM' : 'PM';
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display} ${period}`;
  }

  onActivate(interview: ScheduledInterview): void {
    this.eventActivated.emit(interview);
  }

  trackByInterviewId(_: number, laid: LaidOutEvent): string {
    return laid.item.interview.interviewId;
  }
}
