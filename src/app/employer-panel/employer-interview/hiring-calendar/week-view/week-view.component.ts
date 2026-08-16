import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { endOfWeek, startOfWeek, addDays, format } from 'date-fns';
import { ScheduledInterview } from '@app-shared/interview-scheduling/interview-scheduling.models';
import {
  CalendarEventItem,
  dateKey,
  isToday,
  LaidOutEvent,
  layoutOverlappingEvents,
} from '@app-shared/interview-scheduling/calendar.utils';

const DEFAULT_START_HOUR = 6;
const DEFAULT_END_HOUR = 21;
const WEEK_OPTIONS = { weekStartsOn: 0 as const };

interface DayColumn {
  date: Date;
  dateKey: string;
  laidOutEvents: LaidOutEvent[];
  isToday: boolean;
}

/**
 * Seven-day time grid on desktop/tablet. Below 640px, CSS swaps to a
 * compact day-strip + single-day agenda (see .wv-mobile-* rules in the
 * stylesheet) rather than forcing an unreadable 7-column grid onto a phone
 * screen -- both markup blocks render; only one is visible at a time,
 * decided purely by CSS so it re-flows correctly on resize with no JS
 * viewport detection (SSR-safe by construction).
 */
@Component({
  selector: 'app-week-view',
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.scss'],
})
export class WeekViewComponent implements OnChanges {
  @Input() anchorDate!: Date;
  @Input() bucketedByDay!: Map<string, CalendarEventItem[]>;
  @Input() displayTimeZone!: string;
  @Output() eventActivated = new EventEmitter<ScheduledInterview>();

  days: DayColumn[] = [];
  hours: number[] = [];
  windowStartMinutes = DEFAULT_START_HOUR * 60;
  windowEndMinutes = DEFAULT_END_HOUR * 60;
  selectedMobileDayIndex = 0;

  ngOnChanges(): void {
    const weekStart = startOfWeek(this.anchorDate, WEEK_OPTIONS);
    const weekEnd = endOfWeek(this.anchorDate, WEEK_OPTIONS);

    let startHour = DEFAULT_START_HOUR;
    let endHour = DEFAULT_END_HOUR;

    this.days = [];
    for (let d = weekStart; d <= weekEnd; d = addDays(d, 1)) {
      const key = dateKey(d);
      const events = this.bucketedByDay?.get(key) || [];
      for (const ev of events) {
        startHour = Math.min(startHour, Math.floor(ev.startMinutes / 60));
        endHour = Math.max(endHour, Math.ceil(ev.endMinutes / 60));
      }
      this.days.push({
        date: new Date(d),
        dateKey: key,
        laidOutEvents: layoutOverlappingEvents(events),
        isToday: isToday(d),
      });
    }

    this.windowStartMinutes = startHour * 60;
    this.windowEndMinutes = endHour * 60;
    this.hours = [];
    for (let h = startHour; h < endHour; h++) { this.hours.push(h); }

    // Keep the mobile-selected day pinned to "today" if today is within
    // the newly navigated week, otherwise default to the first day.
    const todayIndex = this.days.findIndex((d) => d.isToday);
    this.selectedMobileDayIndex = todayIndex >= 0 ? todayIndex : 0;
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

  dayHeaderLabel(date: Date): string {
    return format(date, 'EEE d');
  }

  selectMobileDay(index: number): void {
    this.selectedMobileDayIndex = index;
  }

  get selectedMobileDay(): DayColumn | null {
    return this.days[this.selectedMobileDayIndex] || null;
  }

  onActivate(interview: ScheduledInterview): void {
    this.eventActivated.emit(interview);
  }

  trackByDayKey(_: number, day: DayColumn): string {
    return day.dateKey;
  }

  trackByInterviewId(_: number, laid: LaidOutEvent): string {
    return laid.item.interview.interviewId;
  }
}
