import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';
import { ScheduledInterview } from './interview-scheduling.models';
import { splitIsoInTimeZone } from './interview-timezone.utils';

/**
 * Phase 1.5B -- Hiring Calendar date/layout utilities. Pure, deterministic,
 * unit-testable functions with no Angular/DOM dependency. Reuses `date-fns`
 * (already an installed-but-unused dependency in this repo -- audited via
 * package.json before reaching for it, in preference over installing a new
 * calendar library or hand-rolling date arithmetic).
 *
 * `date-fns` operates on plain local-time `Date` objects. The anchor/grid
 * dates here are always constructed to represent wall-clock days in the
 * calendar's chosen DISPLAY timezone (see interview-timezone.utils.ts's
 * splitIsoInTimeZone) -- never the browser's own local zone assumption --
 * so grid math stays correct even when the display timezone differs from
 * the machine running the browser.
 */

export type CalendarViewMode = 'day' | 'week' | 'month' | 'list';

export interface CalendarRange {
  start: Date;
  end: Date;
}

const WEEK_OPTIONS = { weekStartsOn: 0 as const }; // Sunday-start, date-fns default.

/** Visible range for the given view, anchored at `anchorDate` (a local-noon Date representing the selected day). */
export function getVisibleRange(mode: CalendarViewMode, anchorDate: Date): CalendarRange {
  if (mode === 'day') {
    return { start: startOfDay(anchorDate), end: endOfDayInclusive(anchorDate) };
  }
  if (mode === 'week') {
    const start = startOfWeek(anchorDate, WEEK_OPTIONS);
    const end = endOfWeek(anchorDate, WEEK_OPTIONS);
    return { start: startOfDay(start), end: endOfDayInclusive(end) };
  }
  // month
  const start = startOfMonth(anchorDate);
  const end = endOfMonth(anchorDate);
  return { start: startOfDay(start), end: endOfDayInclusive(end) };
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

export function endOfDayInclusive(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

/** Moves the anchor date by one period in the given direction. */
export function shiftAnchor(mode: CalendarViewMode, anchorDate: Date, direction: 'prev' | 'next'): Date {
  const delta = direction === 'next' ? 1 : -1;
  if (mode === 'day') { return delta > 0 ? addDays(anchorDate, 1) : subDays(anchorDate, 1); }
  if (mode === 'week') { return delta > 0 ? addWeeks(anchorDate, 1) : subWeeks(anchorDate, 1); }
  return delta > 0 ? addMonths(anchorDate, 1) : subMonths(anchorDate, 1);
}

/** Full 7-day weeks covering the month, including leading/trailing days from adjacent months -- for month-grid rendering. */
export function getMonthMatrix(anchorDate: Date): Date[][] {
  const monthStart = startOfMonth(anchorDate);
  const monthEnd = endOfMonth(anchorDate);
  const gridStart = startOfWeek(monthStart, WEEK_OPTIONS);
  const gridEnd = endOfWeek(monthEnd, WEEK_OPTIONS);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function isDateInCurrentMonth(date: Date, anchorDate: Date): boolean {
  return isSameMonth(date, anchorDate);
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/** Locale-aware, unambiguous heading text for the current view/anchor. */
export function formatRangeHeading(mode: CalendarViewMode, anchorDate: Date): string {
  if (mode === 'day') {
    return format(anchorDate, 'EEEE, MMMM d, yyyy');
  }
  if (mode === 'week') {
    const start = startOfWeek(anchorDate, WEEK_OPTIONS);
    const end = endOfWeek(anchorDate, WEEK_OPTIONS);
    const sameMonth = isSameMonth(start, end);
    const startLabel = format(start, sameMonth ? 'MMM d' : 'MMM d, yyyy');
    const endLabel = format(end, 'MMM d, yyyy');
    return `${startLabel}–${endLabel}`;
  }
  return format(anchorDate, 'MMMM yyyy');
}

/** 'YYYY-MM-DD' key for a local Date, used to group events by calendar day. */
export function dateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export interface CalendarEventItem {
  interview: ScheduledInterview;
  /** Wall-clock day key (in the calendar's display timezone) this event is grouped under. */
  dayKey: string;
  /** Minutes since local midnight (display timezone) the event starts/ends -- may fall outside [0,1440) if it spans midnight; clamped for layout. */
  startMinutes: number;
  endMinutes: number;
}

/**
 * Buckets interviews by the wall-clock day they occur on *in `displayTimeZone`*
 * -- not the interview's own scheduling timezone, and not UTC. A single
 * calendar grid needs one consistent zone to place events coherently; the
 * interview's own scheduled timezone is still shown on the event/detail text.
 */
export function bucketInterviewsByDay(
  interviews: ScheduledInterview[],
  displayTimeZone: string
): Map<string, CalendarEventItem[]> {
  const map = new Map<string, CalendarEventItem[]>();
  for (const interview of interviews) {
    const startParts = splitIsoInTimeZone(interview.startAt, displayTimeZone);
    const endParts = splitIsoInTimeZone(interview.endAt, displayTimeZone);
    const [sh, smin] = startParts.time.split(':').map((n) => parseInt(n, 10));
    const [eh, emin] = endParts.time.split(':').map((n) => parseInt(n, 10));

    const item: CalendarEventItem = {
      interview,
      dayKey: startParts.date,
      startMinutes: sh * 60 + smin,
      endMinutes: startParts.date === endParts.date ? eh * 60 + emin : 24 * 60,
    };
    const key = startParts.date;
    if (!map.has(key)) { map.set(key, []); }
    map.get(key)!.push(item);
  }
  for (const items of map.values()) {
    items.sort((a, b) => a.startMinutes - b.startMinutes);
  }
  return map;
}

export interface LaidOutEvent {
  item: CalendarEventItem;
  column: number;
  columnCount: number;
}

/**
 * Deterministic overlap layout for one day's events (day/week grid use).
 * Classic interval-graph column assignment: events are placed in the first
 * column whose previous occupant has already ended; columnCount is the max
 * concurrent overlap for that connected cluster, applied uniformly across
 * events sharing an overlap chain so columns stay visually aligned.
 */
export function layoutOverlappingEvents(items: CalendarEventItem[]): LaidOutEvent[] {
  const sorted = [...items].sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);
  const columns: number[] = []; // columns[i] = endMinutes of the last event placed in column i
  const placements: { item: CalendarEventItem; column: number }[] = [];

  for (const item of sorted) {
    let placedColumn = -1;
    for (let c = 0; c < columns.length; c++) {
      if (columns[c] <= item.startMinutes) {
        placedColumn = c;
        break;
      }
    }
    if (placedColumn === -1) {
      placedColumn = columns.length;
      columns.push(item.endMinutes);
    } else {
      columns[placedColumn] = item.endMinutes;
    }
    placements.push({ item, column: placedColumn });
  }

  // Determine the max overlap actually touching each event's own time span
  // (not just the global column count for the whole day) so a busy morning
  // doesn't force narrow columns onto an unrelated solo evening event.
  return placements.map(({ item, column }) => {
    const concurrent = placements.filter(
      (p) => p.item.startMinutes < item.endMinutes && p.item.endMinutes > item.startMinutes
    );
    const columnCount = Math.max(1, ...concurrent.map((p) => p.column + 1));
    return { item, column, columnCount };
  });
}
