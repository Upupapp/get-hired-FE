/**
 * Admin time filter.
 * Today and custom bounds use the Asia/Manila calendar.
 * Last 7 days and Last 30 days are rolling windows (7×24h and 30×24h) ending now,
 * then bucketed onto the Manila dates that window touches.
 */

export type AdminRangePreset = 'today' | '7d' | '30d' | 'custom';

export interface AdminTimeRange {
  preset: AdminRangePreset;
  /** Inclusive YYYY-MM-DD in Asia/Manila. */
  from: string;
  to: string;
  /** Set when a custom range must not be fetched. */
  invalid: string | null;
}

export interface AdminTimePresetOption {
  value: AdminRangePreset;
  label: string;
}

export const ADMIN_TIME_PRESETS: AdminTimePresetOption[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom' },
];

export const ADMIN_TIME_ZONE = 'Asia/Manila';
export const MAX_CUSTOM_RANGE_DAYS = 90;

const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;

export function manilaYmd(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ADMIN_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = partValue(parts, 'year');
  const month = partValue(parts, 'month');
  const day = partValue(parts, 'day');
  return `${year}-${month}-${day}`;
}

export function addDays(ymd: string, days: number): string {
  const match = YMD.exec(ymd);
  if (!match) {
    return ymd;
  }
  const utc = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  utc.setUTCDate(utc.getUTCDate() + days);
  const month = String(utc.getUTCMonth() + 1).padStart(2, '0');
  const day = String(utc.getUTCDate()).padStart(2, '0');
  return `${utc.getUTCFullYear()}-${month}-${day}`;
}

export function inclusiveDayCount(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return 0;
  }
  return Math.round((end - start) / 86400000) + 1;
}

export function eachDay(from: string, to: string): string[] {
  if (!YMD.test(from) || !YMD.test(to) || to < from) {
    return [];
  }
  const days: string[] = [];
  let cursor = from;
  while (cursor <= to && days.length < 366) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function previousWindow(from: string, to: string): { from: string; to: string } {
  const length = Math.max(1, inclusiveDayCount(from, to));
  const toDate = addDays(from, -1);
  return { from: addDays(toDate, -(length - 1)), to: toDate };
}

export function resolvePreset(preset: 'today' | '7d' | '30d', now = new Date()): AdminTimeRange {
  const to = manilaYmd(now);
  if (preset === 'today') {
    return { preset, from: to, to, invalid: null };
  }
  const hours = preset === '30d' ? 30 : 7;
  const from = manilaYmd(new Date(now.getTime() - hours * 24 * 60 * 60 * 1000));
  return { preset, from, to, invalid: null };
}

export function validateCustomRange(from: string, to: string): string | null {
  if (!from || !to) {
    return 'Choose a from and to date.';
  }
  if (!YMD.test(from) || !YMD.test(to)) {
    return 'Use a valid date.';
  }
  if (to < from) {
    return 'End date must be on or after the start date.';
  }
  if (inclusiveDayCount(from, to) > MAX_CUSTOM_RANGE_DAYS) {
    return `Custom range can be at most ${MAX_CUSTOM_RANGE_DAYS} days.`;
  }
  return null;
}

export function readTimeQuery(
  params: { get(name: string): string | null },
  now = new Date()
): AdminTimeRange {
  const range = (params.get('range') || '').trim().toLowerCase();
  const from = (params.get('from') || '').trim();
  const to = (params.get('to') || '').trim();
  if (range === 'today' || range === '7d' || range === '30d') {
    return resolvePreset(range, now);
  }
  if (range === 'custom' || from || to) {
    return {
      preset: 'custom',
      from,
      to,
      invalid: validateCustomRange(from, to),
    };
  }
  return resolvePreset('7d', now);
}

/** Presets use `range`. Custom uses `from` and `to` and clears `range`. */
export function timeQueryParams(range: AdminTimeRange): { range: string | null; from: string | null; to: string | null } {
  if (range.preset === 'custom') {
    return {
      range: null,
      from: range.from || null,
      to: range.to || null,
    };
  }
  return { range: range.preset, from: null, to: null };
}

export function rangeKey(range: AdminTimeRange): string {
  return `${range.preset}|${range.from}|${range.to}|${range.invalid || ''}`;
}

export function formatVisitDelta(total: number | null, previous: number | null): string {
  if (total == null || previous == null) {
    return '';
  }
  const absolute = total - previous;
  const sign = absolute > 0 ? '+' : '';
  const arrow = absolute > 0 ? '▲' : absolute < 0 ? '▼' : '–';
  if (previous === 0) {
    return `${arrow} ${sign}${absolute} vs prior period`;
  }
  const percent = Math.round((absolute / previous) * 100);
  const percentSign = percent > 0 ? '+' : '';
  return `${arrow} ${percentSign}${percent}% · ${sign}${absolute} vs prior period`;
}

export function visitDirection(total: number | null, previous: number | null): 'up' | 'down' | 'flat' | 'none' {
  if (total == null || previous == null) {
    return 'none';
  }
  if (total > previous) {
    return 'up';
  }
  if (total < previous) {
    return 'down';
  }
  return 'flat';
}

export function sparklinePoints(series: { count: number }[], width = 240, height = 48): string {
  const mid = (height / 2).toFixed(1);
  const flat = `0,${mid} ${width},${mid}`;
  if (!series.length) {
    return flat;
  }
  const max = series.reduce((highest, point) => Math.max(highest, point.count), 0);
  if (max <= 0) {
    return flat;
  }
  const step = series.length === 1 ? 0 : width / (series.length - 1);
  return series.map((point, index) => {
    const x = series.length === 1 ? width / 2 : index * step;
    const y = height - 4 - (point.count / max) * (height - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function partValue(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  const found = parts.find(part => part.type === type);
  return found ? found.value : '';
}
