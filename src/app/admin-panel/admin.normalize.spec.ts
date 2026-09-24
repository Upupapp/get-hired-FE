import { Dashboard } from './admin.model';
import {
  buildAdminQuery,
  formatAdminDate,
  formatAdminDay,
  formatAdminMoney,
  isPublishedStatus,
  jobStatusLabel,
  jobStatusQueryValue,
  normalizeApplication,
  normalizeCompany,
  normalizeCompanyDetail,
  normalizeDashboard,
  normalizeFinance,
  normalizeJob,
  normalizePage,
  normalizeUser,
  profileFields,
  readHttpError,
  roleLabel,
} from './admin.normalize';

describe('admin response normalizers', () => {
  it('reads dashboard KPIs from the data envelope and from camelCase', () => {
    const fromEnvelope = normalizeDashboard({
      data: {
        users_total: 10,
        jobseekers_total: 6,
        employers_total: 3,
        admins_total: 1,
        jobs_active: 4,
        jobs_total: 8,
        applications_7d: 2,
        applications_30d: 9,
        companies_total: 3,
      }
    });
    expect(fromEnvelope).toEqual({
      usersTotal: 10,
      jobseekersTotal: 6,
      employersTotal: 3,
      adminsTotal: 1,
      jobsActive: 4,
      jobsTotal: 8,
      applications7d: 2,
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
    } as Dashboard);

    expect(normalizeDashboard({ usersTotal: 0, jobsActive: 1 }).usersTotal).toBe(0);
    expect(normalizeDashboard({ data: {} })).toBeNull();
    expect(normalizeDashboard(null)).toBeNull();

    const visits = normalizeDashboard({
      data: {
        visits_total: 12,
        visits_previous: 9,
        visits_metric_label: 'Sessions',
        visits_series: [{ date: '2026-09-23', count: 12 }],
        applications_in_range: 4,
      }
    });
    expect(visits.visitsTotal).toBe(12);
    expect(visits.visitsPrevious).toBe(9);
    expect(visits.visitsMetricLabel).toBe('Sessions');
    expect(visits.visitsSeries).toEqual([{ date: '2026-09-23', count: 12 }]);
    expect(visits.applicationsInRange).toBe(4);
    expect(visits.fixtureMode).toBe('live');
  });

  it('maps user, job, and company rows from snake_case or camelCase', () => {
    expect(normalizeUser({
      uid: 'U1',
      email: 'a@b.com',
      role: 3,
      first_name: 'Ada',
      last_name: 'Lovelace',
      created_at: '2026-01-02',
    })).toEqual(jasmine.objectContaining({
      uid: 'U1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      role: 3,
    }));

    const job = normalizeJob({
      job_id: 'JB-1',
      title: 'Chef',
      company_name: 'Acme',
      status: 2,
      applicant_count: 4,
    });
    expect(job.jobId).toBe('JB-1');
    expect(job.statusLabel).toBe('Published');
    expect(job.applicantCount).toBe(4);
    expect(isPublishedStatus(job.status)).toBeTrue();
    expect(isPublishedStatus('draft')).toBeFalse();
    expect(jobStatusLabel(4)).toBe('Archived');
    expect(jobStatusQueryValue('draft')).toBe(1);
    expect(jobStatusQueryValue('published')).toBe(2);
    expect(jobStatusQueryValue('expired')).toBe(3);
    expect(jobStatusQueryValue('archived')).toBe(4);
    expect(jobStatusQueryValue('2')).toBe(2);
    expect(jobStatusQueryValue('')).toBeUndefined();

    expect(normalizeApplication({
      application_id: 'AP-1',
      date_applied: '2026-09-23T09:00:00+08:00',
      seeker_name: 'Ada Cruz',
      seeker_email: 'ada.cruz@example.com',
      job_id: 'JB-1',
      job_title: 'Chef',
      company_name: 'Acme',
      status: 'Submitted',
    })).toEqual(jasmine.objectContaining({
      applicationId: 'AP-1',
      seekerEmail: 'ada.cruz@example.com',
      jobTitle: 'Chef',
    }));
    expect(normalizeUser({ email: 'a@b.com' }).lastLogin).toBeNull();
    expect(formatAdminDate(null)).toBe('—');
    expect(formatAdminDay('2026-09-23T09:00:00+08:00')).toBe('Sep 23, 2026');
    expect(formatAdminMoney(null)).toBe('—');
    expect(formatAdminMoney(3490).replace(/[^\d]/g, '')).toBe('3490');

    expect(normalizeCompany({
      company_id: 'CO-1',
      company_name: 'Acme',
      slug: 'acme',
      open_jobs_count: 2,
    })).toEqual(jasmine.objectContaining({
      companyId: 'CO-1',
      openJobsCount: 2,
    }));
  });

  it('normalizes a paged payload and a bare page', () => {
    const page = normalizePage(
      { data: { items: [{ email: 'a@b.com', role: '2' }], total: 40, page: 2, pageSize: 25 } },
      normalizeUser,
      1,
      25
    );
    expect(page.total).toBe(40);
    expect(page.page).toBe(2);
    expect(page.items[0].email).toBe('a@b.com');
    expect(roleLabel(page.items[0].role)).toBe('Employer');

    const bare = normalizePage([{ companyName: 'Solo' }], normalizeCompany, 1, 25);
    expect(bare.items.length).toBe(1);
    expect(bare.total).toBe(1);
  });

  it('hides secrets when flattening a user profile', () => {
    const fields = profileFields({
      email: 'a@b.com',
      role: 1,
      password: 'nope',
      refreshToken: 'nope',
      profile: { city: 'Manila' },
    });
    const labels = fields.map(field => field.label);
    expect(labels).toContain('Email');
    expect(labels).toContain('Role');
    expect(labels).toContain('Profile city');
    expect(labels.some(label => /password|token/i.test(label))).toBeFalse();
    expect(fields.find(field => field.label === 'Role').value).toBe('Admin');
  });

  it('normalizes finance and company detail, and ignores a company list', () => {
    const finance = normalizeFinance({
      data: {
        currency: 'PHP',
        active_count: 2,
        mrr: 4980,
        plans: [{ slug: 'business', label: 'Business', company_count: 1, pct: 20 }],
        revenue_in_range: 1490,
        subscriptions: { items: [{ company_id: 'CO-1', company_name: 'Acme', plan_slug: 'business', status: 'active', mrr_php: 5990, cycle: 'monthly' }], total: 1 },
        payments: [{ external_id: 'pay_1', amount_php: 1490, status: 'succeeded', paid_at: '2026-09-24', plan_slug: 'business' }],
      }
    });
    expect(finance.mrr).toBe(4980);
    expect(finance.plans[0].label).toBe('Business');
    expect(finance.plans[0].pct).toBe(20);
    expect(finance.subscriptions.items[0].planLabel).toBe('Business');
    expect(finance.payments.items[0].externalId).toBe('pay_1');
    expect(finance.payments.items[0].status).toBe('succeeded');
    expect(finance.fromFixture).toBeFalse();
    expect(normalizeFinance({ data: { items: [] } })).toBeNull();

    expect(normalizeCompanyDetail({ data: { items: [{ company_id: 'CO-1' }], total: 1 } })).toBeNull();
    const detail = normalizeCompanyDetail({
      data: {
        company_id: 'CO-20',
        company_name: "Lola's Table",
        admin_contact: { name: 'Rosa', email: 'rosa@example.com', phone: '+63 917', role: 'Company admin' },
        subscription: { plan_slug: 'growth', plan: 'Growth', status: 'active', mrr: 3490 },
        payments: [{ invoice_id: 'INV-CO-20', amount: 3490, status: 'Paid' }],
        history: [{ at: '2026-08-01', kind: 'Plan change', summary: 'Moved from Starter to Growth', actor: 'Rosa' }],
      }
    });
    expect(detail.companyId).toBe('CO-20');
    expect(detail.adminContact.role).toBe('Company admin');
    expect(detail.admins.length).toBe(1);
    expect(detail.history[0].actor).toBe('Rosa');
    expect(detail.subscription.plan).toBe('Growth');
  });

  it('builds query strings and reads http errors', () => {
    expect(buildAdminQuery({ q: 'a b', role: '', page: 1, pageSize: 25 }))
      .toBe('?q=a%20b&page=1&pageSize=25');
    expect(readHttpError({ error: { error: 'Not allowed' } }, 'fallback')).toBe('Not allowed');
    expect(readHttpError({ status: 0 }, 'fallback')).toBe('Could not reach the server.');
    expect(readHttpError({}, 'fallback')).toBe('fallback');
  });
});
