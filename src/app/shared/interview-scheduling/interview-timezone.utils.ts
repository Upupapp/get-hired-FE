/**
 * Dependency-free IANA timezone helpers for the Internal Interview
 * Scheduling MVP. This repo has no moment-timezone / date-fns-tz / luxon
 * dependency, so wall-clock <-> UTC conversion is done with the browser's
 * built-in Intl.DateTimeFormat (which natively supports arbitrary IANA
 * `timeZone` identifiers) using the standard "guess, measure offset,
 * correct" technique that libraries like date-fns-tz use internally.
 */

/** Best-effort default: the employer's own browser timezone. */
export function detectBrowserTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** True if `timeZone` is a value the browser's ICU data recognizes as a valid IANA zone. */
export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) { return false; }
  try {
    // Throws a RangeError for unknown zone identifiers.
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

interface DateTimeFieldParts {
  year: number;
  month: number; // 1-based
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function getZonedFieldParts(date: Date, timeZone: string): DateTimeFieldParts {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  parts.forEach((p) => {
    if (p.type !== 'literal') { map[p.type] = p.value; }
  });
  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    // h23 can still emit "24" for midnight in some ICU implementations.
    hour: parseInt(map.hour, 10) % 24,
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10),
  };
}

/** Minutes such that: (wall-clock time shown in `timeZone`) = instant + offsetMinutes. */
function getTimeZoneOffsetMinutes(instant: Date, timeZone: string): number {
  const zoned = getZonedFieldParts(instant, timeZone);
  const asIfUtc = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second);
  return (asIfUtc - instant.getTime()) / 60000;
}

/**
 * Converts a wall-clock date/time that the employer picked *as observed in
 * `timeZone`* into the equivalent UTC instant, returned as an ISO string.
 *
 * Example: date="2026-08-20", time="14:30", timeZone="Asia/Manila"
 *   -> the UTC instant that reads as 2026-08-20 14:30 in Manila.
 */
export function zonedWallTimeToUtcIso(date: string, time: string, timeZone: string): string {
  const [y, m, d] = date.split('-').map((n) => parseInt(n, 10));
  const [h, mi] = time.split(':').map((n) => parseInt(n, 10));
  if (!y || !m || !d || isNaN(h) || isNaN(mi)) {
    throw new Error('Invalid date/time');
  }

  let instant = new Date(Date.UTC(y, m - 1, d, h, mi, 0));
  const target = instant.getTime();

  // Two passes converge even across DST-transition boundaries.
  for (let i = 0; i < 2; i++) {
    const offsetMinutes = getTimeZoneOffsetMinutes(instant, timeZone);
    instant = new Date(target - offsetMinutes * 60000);
  }

  return instant.toISOString();
}

/** Splits a UTC ISO instant into the {date, time} fields as displayed in `timeZone`. */
export function splitIsoInTimeZone(iso: string, timeZone: string): { date: string; time: string } {
  const zoned = getZonedFieldParts(new Date(iso), timeZone);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${zoned.year}-${pad(zoned.month)}-${pad(zoned.day)}`,
    time: `${pad(zoned.hour)}:${pad(zoned.minute)}`,
  };
}

/** Human-readable "Aug 20, 2026, 2:30 PM" rendered in the given IANA timezone. */
export function formatInTimeZone(iso: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
}

/** Short zone abbreviation/offset, e.g. "GMT+8", for compact display next to a time. */
export function formatTimeZoneLabel(timeZone: string): string {
  try {
    // 'shortOffset' is a valid runtime value (all evergreen browsers support
    // it) but isn't in this project's TS lib's Intl.DateTimeFormatOptions
    // union yet -- cast just this literal rather than downgrade to 'short'
    // (which can render as a zone abbreviation like "PST" instead of a
    // numeric offset, which is what we actually want here).
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset' as any,
    }).formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart ? `${timeZone} (${tzPart.value})` : timeZone;
  } catch {
    return timeZone;
  }
}

/** RFC4122 v4 UUID, generated without pulling in a new dependency. */
export function generateUuidV4(): string {
  const g = (globalThis as any);
  if (g?.crypto?.randomUUID) {
    return g.crypto.randomUUID();
  }
  if (g?.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    g.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // Last-resort fallback (non-cryptographic) -- only reachable in environments
  // without any Web Crypto support at all.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
