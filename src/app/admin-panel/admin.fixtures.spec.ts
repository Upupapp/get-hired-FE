import { AdminTimeRange } from './admin-time';
import {
  FIXTURE_VISITS_LABEL,
  applyDashboardFixture,
  fixtureApplications,
  fixtureCompanies,
  fixtureCompanyDetail,
  fixtureDashboard,
  fixtureFinance,
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

  it('keeps subscription MRR as a snapshot and sums only paid revenue inside the range', () => {
    const finance = fixtureFinance({
      from: '2026-09-17',
      to: '2026-09-24',
      page: 1,
      pageSize: 25,
      paymentPage: 1,
    }, now);
    expect(finance.mrr).toBe(27972);
    expect(finance.activeCount).toBe(4);
    expect(finance.payingCompanies).toBe(4);
    expect(finance.trialCount).toBe(1);
    expect(finance.pastDueCount).toBe(1);
    expect(finance.revenueInRange).toBe(22980);
    expect(finance.subscriptions.total).toBe(7);
    const business = finance.plans.find(plan => plan.slug === 'business');
    expect(business.label).toBe('Business');
    expect(business.count).toBe(2);
    expect(business.pct).toBe(29);
    expect(finance.plans.map(plan => plan.label)).toEqual(['Free trial', 'Starter', 'Growth', 'Business', 'Other']);
    expect(finance.payments.items.some(row => row.status === 'failed')).toBeTrue();
    expect(finance.payments.items.some(row => row.status === 'pending')).toBeTrue();
    expect(finance.payments.items.filter(row => row.status === 'failed').every(row => row.paidAt >= '2026-09-17')).toBeTrue();

    const named = fixtureFinance({
      from: '2026-09-17',
      to: '2026-09-24',
      q: 'harbor',
      page: 1,
      pageSize: 25,
      paymentPage: 1,
    }, now);
    expect(named.mrr).toBe(27972);
    expect(named.revenueInRange).toBe(22980);
    expect(named.subscriptions.total).toBe(1);
    expect(named.subscriptions.items[0].planLabel).toBe('Starter');

    const growth = fixtureFinance({
      from: '2026-09-17',
      to: '2026-09-24',
      plan: 'growth',
      page: 1,
      pageSize: 25,
      paymentPage: 1,
    }, now);
    expect(growth.subscriptions.total).toBe(1);
    expect(growth.subscriptions.items[0].mrr).toBe(3490);
    expect(growth.mrr).toBe(27972);

    const future = fixtureFinance({
      from: '2026-12-01',
      to: '2026-12-07',
      page: 1,
      pageSize: 25,
      paymentPage: 1,
    }, now);
    expect(future.revenueInRange).toBe(0);
    expect(future.payments.total).toBe(0);
    expect(future.subscriptions.total).toBe(7);
    expect(future.mrr).toBe(27972);
  });

  it('builds a full employer record and refuses an unknown company', () => {
    expect(fixtureCompanyDetail('missing', now)).toBeNull();
    const detail = fixtureCompanyDetail('CO-20', now);
    expect(detail.adminContact.role).toBe('Company admin');
    expect(detail.adminContact.phone).toContain('+63');
    expect(detail.subscription.plan).toBe('Growth');
    expect(detail.subscription.mrr).toBe(3490);
    expect(detail.subscription.entitlements).toEqual([
      { label: 'Jobs', used: 2, limit: 6 },
      { label: 'Admins', used: 1, limit: 3 },
      { label: 'Videos', used: 8, limit: 100 },
    ]);
    expect(detail.payments.length).toBeGreaterThan(0);
    expect(detail.payments.every(row => row.companyId === 'CO-20')).toBeTrue();
    expect(detail.history.some(event => event.summary.indexOf('Kitchen Lead') !== -1)).toBeTrue();
    expect(detail.history.some(event => event.summary.indexOf('Moved from Starter to Growth') !== -1)).toBeTrue();
    const northline = fixtureCompanyDetail('CO-22', now);
    expect(northline.subscription.plan).toBe('Business');
    expect(northline.subscription.cycle).toBe('annual');
    expect(northline.subscription.mrr).toBe(4992);
    expect(northline.admins.length).toBe(6);
    const harbor = fixtureCompanyDetail('CO-21', now);
    expect(harbor.history.some(event => event.kind === 'Job unpublish' && event.actor === 'Ops admin')).toBeTrue();
    const directory = fixtureCompanies({ page: 1, pageSize: 25 });
    expect(directory.items.map(row => row.companyId)).toEqual(['CO-20', 'CO-21', 'CO-22', 'CO-23', 'CO-24', 'CO-25', 'CO-26']);
  });
});
