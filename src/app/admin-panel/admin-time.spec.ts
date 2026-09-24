import {
  addDays,
  formatVisitDelta,
  inclusiveDayCount,
  manilaYmd,
  readTimeQuery,
  resolvePreset,
  sparklinePoints,
  timeQueryParams,
  validateCustomRange,
  visitDirection,
} from './admin-time';

describe('admin time filter', () => {
  const manilaEvening = new Date('2026-09-23T15:30:00.000Z');

  it('uses the Asia/Manila calendar for today', () => {
    expect(manilaYmd(manilaEvening)).toBe('2026-09-23');
    expect(manilaYmd(new Date('2026-09-23T16:30:00.000Z'))).toBe('2026-09-24');
    const today = resolvePreset('today', manilaEvening);
    expect(today).toEqual({ preset: 'today', from: '2026-09-23', to: '2026-09-23', invalid: null });
  });

  it('treats last 7 days as a rolling window bucketed onto Manila dates', () => {
    const week = resolvePreset('7d', manilaEvening);
    expect(week.preset).toBe('7d');
    expect(week.to).toBe('2026-09-23');
    expect(week.from).toBe(manilaYmd(new Date(manilaEvening.getTime() - 7 * 24 * 60 * 60 * 1000)));
    expect(week.invalid).toBeNull();
    expect(readTimeQuery({ get: () => null }, manilaEvening).preset).toBe('7d');
  });

  it('syncs presets with range and custom ranges with from and to', () => {
    expect(timeQueryParams(resolvePreset('30d', manilaEvening))).toEqual({
      range: '30d',
      from: null,
      to: null,
    });
    const custom = readTimeQuery({
      get: (name: string) => (name === 'from' ? '2026-09-01' : name === 'to' ? '2026-09-10' : null),
    });
    expect(custom.preset).toBe('custom');
    expect(custom.invalid).toBeNull();
    expect(timeQueryParams(custom)).toEqual({ range: null, from: '2026-09-01', to: '2026-09-10' });
  });

  it('rejects an inverted custom range and a span over 90 days', () => {
    expect(validateCustomRange('2026-09-10', '2026-09-01')).toBe('End date must be on or after the start date.');
    expect(inclusiveDayCount('2026-09-01', '2026-11-29')).toBe(90);
    expect(validateCustomRange('2026-09-01', '2026-11-29')).toBeNull();
    expect(validateCustomRange('2026-09-01', addDays('2026-09-01', 90))).toContain('90 days');
    const invalid = readTimeQuery({
      get: (name: string) => (name === 'from' ? '2026-09-10' : name === 'to' ? '2026-09-01' : null),
    });
    expect(invalid.invalid).toContain('End date');
  });

  it('describes the previous period and flattens an empty sparkline', () => {
    expect(formatVisitDelta(120, 100)).toBe('▲ +20% · +20 vs prior period');
    expect(visitDirection(80, 100)).toBe('down');
    expect(formatVisitDelta(0, null)).toBe('');
    const flat = sparklinePoints([{ count: 0 }, { count: 0 }]);
    expect(flat.startsWith('0,')).toBeTrue();
    expect(sparklinePoints([{ count: 1 }, { count: 3 }]).split(' ').length).toBe(2);
  });
});
