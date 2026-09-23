import { AdminTimeRange } from './admin-time';
import {
  FIXTURE_VISITS_LABEL,
  applyDashboardFixture,
  fixtureApplications,
  fixtureDashboard,
  fixtureJobs,
  fixtureUsers,
} from './admin.fixtures';
import { Dashboard } from './admin.model';

describe('admin fixtures', () => {
  const now = new Date('2026-09-24T04:00:00.000Z');
  const range: AdminTimeRange = {
    preset: 'custom',
    from: '2026-09-01',
    to: '2026-09-03',
    invalid: null,
  };

  it('labels fixture visits as pageviews and keeps the series total honest', () => {
    const dash = fixtureDashboard(range, now);
    expect(dash.visitsMetricLabel).toBe(FIXTURE_VISITS_LABEL);
    expect(dash.visitsMetricLabel).toBe('Pageviews (fixture)');
    expect(dash.visitsSeries.length).toBe(3);
    expect(dash.visitsTotal).toBe(dash.visitsSeries.reduce((sum, point) => sum + point.count, 0));
    expect(dash.fixtureMode).toBe('fixture');
    const page = fixtureApplications({ q: '', from: range.from, to: range.to, page: 1, pageSize: 25 }, now);
    expect(dash.applicationsInRange).toBe(page.total);
  });

  it('returns a flat zero series when the whole custom range is still in the future', () => {
    const empty = fixtureDashboard({
      preset: 'custom',
      from: '2026-12-01',
      to: '2026-12-07',
      invalid: null,
    }, now);
    expect(empty.visitsTotal).toBe(0);
    expect(empty.visitsSeries.every(point => point.count === 0)).toBeTrue();
    expect(empty.applicationsInRange).toBe(0);
  });

  it('pages application fixtures at 25 and keeps a missing last login', () => {
    const page = fixtureApplications({
      q: '',
      from: '2026-01-01',
      to: '2026-09-24',
      page: 2,
      pageSize: 25,
    }, now);
    expect(page.page).toBe(2);
    expect(page.pageSize).toBe(25);
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.total).toBeGreaterThan(25);
    expect(fixtureUsers({ page: 1, pageSize: 25 }).items.some(row => row.lastLogin == null)).toBeTrue();
  });

  it('filters fixture jobs with the same 1–4 status ids the live request uses', () => {
    const published = fixtureJobs({ status: 'published', page: 1, pageSize: 25 });
    expect(published.items.length).toBeGreaterThan(0);
    expect(published.items.every(row => row.status === 2)).toBeTrue();
    expect(fixtureJobs({ status: 'draft', page: 1, pageSize: 25 }).items.every(row => row.status === 1)).toBeTrue();
  });

  it('keeps live inventory and only fills visits that the payload omitted', () => {
    const live: Dashboard = {
      usersTotal: 10,
      jobseekersTotal: null,
      employersTotal: null,
      adminsTotal: null,
      jobsActive: null,
      jobsTotal: null,
      applications7d: 4,
      applications30d: 9,
      companiesTotal: 3,
      range: null,
      from: null,
      to: null,
      visitsTotal: null,
      visitsPrevious: null,
      visitsSeries: [],
      visitsMetricLabel: null,
      applicationsInRange: null,
      applicationsInRangeFixture: false,
      fixtureMode: 'live',
    };
    const mixed = applyDashboardFixture(live, {
      preset: '7d',
      from: '2026-09-17',
      to: '2026-09-24',
      invalid: null,
    }, now);
    expect(mixed.usersTotal).toBe(10);
    expect(mixed.companiesTotal).toBe(3);
    expect(mixed.visitsMetricLabel).toBe('Pageviews (fixture)');
    expect(mixed.applicationsInRange).toBe(4);
    expect(mixed.applicationsInRangeFixture).toBeFalse();
    expect(mixed.fixtureMode).toBe('mixed');
  });
});
