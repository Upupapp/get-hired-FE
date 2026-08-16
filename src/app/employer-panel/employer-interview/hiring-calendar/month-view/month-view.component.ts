import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { format } from 'date-fns';
import { ScheduledInterview } from '@app-shared/interview-scheduling/interview-scheduling.models';
import {
  CalendarEventItem,
  dateKey,
  getMonthMatrix,
  isDateInCurrentMonth,
  isToday,
} from '@app-shared/interview-scheduling/calendar.utils';

const MAX_VISIBLE_PER_CELL = 3;

interface MonthCell {
  date: Date;
  dateKey: string;
  inCurrentMonth: boolean;
  isToday: boolean;
  visibleEvents: CalendarEventItem[];
  overflowCount: number;
}

/**
 * Month overview grid. Each cell shows a capped number of event summaries
 * plus a keyboard-accessible "+N more" -- selecting either the date number
 * or the overflow control switches to Day view for that date (the
 * "simplest maintainable interaction" this phase's spec calls for),
 * rather than building a second inline popover UI.
 */
@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.scss'],
})
export class MonthViewComponent implements OnChanges {
  @Input() anchorDate!: Date;
  @Input() bucketedByDay!: Map<string, CalendarEventItem[]>;
  @Input() displayTimeZone!: string;
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() eventActivated = new EventEmitter<ScheduledInterview>();

  weeks: MonthCell[][] = [];
  readonly weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  ngOnChanges(): void {
    const matrix = getMonthMatrix(this.anchorDate);
    this.weeks = matrix.map((week) =>
      week.map((date) => {
        const key = dateKey(date);
        const events = this.bucketedByDay?.get(key) || [];
        return {
          date,
          dateKey: key,
          inCurrentMonth: isDateInCurrentMonth(date, this.anchorDate),
          isToday: isToday(date),
          visibleEvents: events.slice(0, MAX_VISIBLE_PER_CELL),
          overflowCount: Math.max(0, events.length - MAX_VISIBLE_PER_CELL),
        };
      })
    );
  }

  dayNumberLabel(date: Date): string {
    return format(date, 'd');
  }

  cellAriaLabel(cell: MonthCell): string {
    const total = cell.visibleEvents.length + cell.overflowCount;
    return `${format(cell.date, 'EEEE, MMMM d, yyyy')}, ${total} interview${total === 1 ? '' : 's'}`;
  }

  selectDate(date: Date): void {
    this.dateSelected.emit(date);
  }

  onActivate(interview: ScheduledInterview): void {
    this.eventActivated.emit(interview);
  }

  trackByDayKey(_: number, cell: MonthCell): string {
    return cell.dateKey;
  }

  trackByWeek(index: number): number {
    return index;
  }

  trackByInterviewId(_: number, item: CalendarEventItem): string {
    return item.interview.interviewId;
  }
}
