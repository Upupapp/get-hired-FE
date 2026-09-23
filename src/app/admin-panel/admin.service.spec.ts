import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';
import { BaseService } from '@main/core/services/base.service';
import { environment } from '@environments/environment';

describe('AdminService admin MVP endpoints', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BaseService, AdminService],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lists users with q, role, page, and pageSize', () => {
    let total = -1;
    service.listUsers({ q: 'ada@example.com', role: '3', page: 2, pageSize: 25 }).subscribe(page => {
      total = page.total;
      expect(page.items[0].uid).toBe('U-1');
      expect(page.items[0].firstName).toBe('Ada');
    });

    const req = httpMock.expectOne(
      `${environment.api_url}/admin/users?q=ada%40example.com&role=3&page=2&pageSize=25`
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {
        items: [{ uid: 'U-1', email: 'ada@example.com', role: 3, first_name: 'Ada', last_name: 'L' }],
        total: 1,
        page: 2,
        pageSize: 25,
      }
    });
    expect(total).toBe(1);
  });

  it('lists jobs and companies', () => {
    service.listJobs({ q: 'chef', status: 'published', page: 1, pageSize: 25 }).subscribe(page => {
      expect(page.items[0].statusLabel).toBe('Published');
    });
    const jobs = httpMock.expectOne(
      `${environment.api_url}/admin/jobs?q=chef&status=2&page=1&pageSize=25`
    );
    jobs.flush({ items: [{ job_id: 'JB-1', title: 'Chef', status: 'published', applicant_count: 1 }], total: 1, page: 1, pageSize: 25 });

    service.listCompanies({ q: 'acme', page: 1, pageSize: 25 }).subscribe(page => {
      expect(page.items[0].openJobsCount).toBe(2);
    });
    const companies = httpMock.expectOne(
      `${environment.api_url}/admin/companies?q=acme&page=1&pageSize=25`
    );
    companies.flush({ data: { items: [{ company_id: 'CO-1', company_name: 'Acme', open_jobs_count: 2 }], total: 1 } });
  });

  it('maps every job status word onto job_status_id before the request', () => {
    const cases: { word: string; id: string }[] = [
      { word: 'draft', id: '1' },
      { word: 'expired', id: '3' },
      { word: 'archived', id: '4' },
    ];
    cases.forEach(entry => {
      service.listJobs({ status: entry.word, page: 1, pageSize: 25 }).subscribe();
      const req = httpMock.expectOne(
        `${environment.api_url}/admin/jobs?status=${entry.id}&page=1&pageSize=25`
      );
      expect(req.request.method).toBe('GET');
      req.flush({ items: [], total: 0, page: 1, pageSize: 25 });
    });
    expect(cases.map(entry => entry.id)).toEqual(['1', '3', '4']);
  });

  it('keeps live dashboard inventory and fills missing visits from fixtures', () => {
    let label = '';
    let users = -1;
    let applications = -1;
    service.getDashboardDetails({
      preset: '7d',
      from: '2026-09-17',
      to: '2026-09-24',
      invalid: null,
    }).subscribe(dash => {
      label = dash.visitsMetricLabel;
      users = dash.usersTotal;
      applications = dash.applicationsInRange;
      expect(dash.fixtureMode).toBe('mixed');
      expect(dash.visitsTotal).toBeGreaterThan(0);
    });

    const req = httpMock.expectOne(
      `${environment.api_url}/admin/dashboard?range=7d&from=2026-09-17&to=2026-09-24`
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {
        users_total: 10,
        applications_7d: 4,
        companies_total: 3,
      }
    });
    expect(label).toBe('Pageviews (fixture)');
    expect(users).toBe(10);
    expect(applications).toBe(4);
  });

  it('uses the live visits payload when the dashboard already includes it', () => {
    let label = '';
    service.getDashboardDetails({
      preset: 'today',
      from: '2026-09-24',
      to: '2026-09-24',
      invalid: null,
    }).subscribe(dash => {
      label = dash.visitsMetricLabel;
      expect(dash.visitsTotal).toBe(9);
      expect(dash.applicationsInRange).toBe(2);
      expect(dash.fixtureMode).toBe('live');
      expect(dash.applicationsInRangeFixture).toBeFalse();
    });
    const req = httpMock.expectOne(request => request.url.indexOf('/admin/dashboard?') === 0 || request.url.indexOf('/admin/dashboard?') > -1);
    req.flush({
      data: {
        users_total: 3,
        visits_total: 9,
        visits_previous: 3,
        visits_series: [{ date: '2026-09-24', count: 9 }],
        visits_metric_label: 'Sessions',
        applications_in_range: 2,
      }
    });
    expect(label).toBe('Sessions');
  });

  it('falls back to a dashboard fixture when the dashboard call fails', () => {
    let mode = '';
    service.getDashboardDetails({
      preset: '7d',
      from: '2026-09-17',
      to: '2026-09-24',
      invalid: null,
    }).subscribe(dash => {
      mode = dash.fixtureMode;
      expect(dash.visitsMetricLabel).toBe('Pageviews (fixture)');
      expect(dash.usersTotal).toBeGreaterThan(0);
    });
    const req = httpMock.expectOne(request => request.url.indexOf('/admin/dashboard') !== -1);
    req.flush('down', { status: 500, statusText: 'Server Error' });
    expect(mode).toBe('fixture');
  });

  it('does not replace an unauthorized dashboard response with fixtures', () => {
    let failed = false;
    service.getDashboardDetails({
      preset: '7d',
      from: '2026-09-17',
      to: '2026-09-24',
      invalid: null,
    }).subscribe({
      next: () => fail('expected the 401 to surface'),
      error: () => { failed = true; },
    });
    const req = httpMock.expectOne(request => request.url.indexOf('/admin/dashboard') !== -1);
    req.flush('no', { status: 401, statusText: 'Unauthorized' });
    expect(failed).toBeTrue();
  });

  it('uses application fixtures when the applications endpoint fails', () => {
    let total = -1;
    service.listApplications({
      q: '',
      from: '2020-01-01',
      to: '2030-01-01',
      page: 1,
      pageSize: 25,
    }).subscribe(page => {
      total = page.total;
      expect(page.fromFixture).toBeTrue();
      expect(page.pageSize).toBe(25);
      expect(page.items[0].applicationId).toBeTruthy();
      expect(page.items.length).toBeLessThanOrEqual(25);
    });
    const req = httpMock.expectOne(
      `${environment.api_url}/admin/applications?from=2020-01-01&to=2030-01-01&page=1&pageSize=25`
    );
    req.flush('missing', { status: 404, statusText: 'Not Found' });
    expect(total).toBeGreaterThan(25);
  });

  it('uses finance fixtures when the finance endpoint fails, and keeps a live payload', () => {
    let mrr = -1;
    service.getFinance({
      range: '7d',
      from: '2026-09-17',
      to: '2026-09-24',
      page: 1,
      pageSize: 25,
      paymentPage: 1,
    }).subscribe(page => {
      mrr = page.mrr;
      expect(page.fromFixture).toBeTrue();
      expect(page.activeCount).toBe(4);
    });
    const missing = httpMock.expectOne(
      `${environment.api_url}/admin/finance?range=7d&from=2026-09-17&to=2026-09-24&page=1&pageSize=25&payPage=1`
    );
    missing.flush('missing', { status: 404, statusText: 'Not Found' });
    expect(mrr).toBe(28970);

    let liveMrr = -1;
    service.getFinance({
      from: '2026-09-24',
      to: '2026-09-24',
      companyId: 'CO-20',
      page: 1,
      pageSize: 25,
      paymentPage: 1,
    }).subscribe(page => {
      liveMrr = page.mrr;
      expect(page.fromFixture).toBeFalse();
      expect(page.plans[0].plan).toBe('Premium');
    });
    const live = httpMock.expectOne(
      `${environment.api_url}/admin/finance?from=2026-09-24&to=2026-09-24&company=CO-20&page=1&pageSize=25&payPage=1`
    );
    live.flush({
      data: {
        mrr: 100,
        plans: [{ slug: 'business', name: 'Business', count: 1, mrr: 100 }],
        revenue_in_range: 100,
      }
    });
    expect(liveMrr).toBe(100);
  });

  it('does not replace an unauthorized finance response with fixtures', () => {
    let failed = false;
    service.getFinance({ page: 1, pageSize: 25, paymentPage: 1 }).subscribe({
      next: () => fail('expected the 401 to surface'),
      error: () => { failed = true; },
    });
    const req = httpMock.expectOne(request => request.url.indexOf('/admin/finance') !== -1);
    req.flush('no', { status: 401, statusText: 'Unauthorized' });
    expect(failed).toBeTrue();
  });

  it('loads a company detail fixture when the detail endpoint is missing', () => {
    let name = '';
    service.getCompanyDetail('CO-20').subscribe(detail => {
      name = detail.companyName;
      expect(detail.fromFixture).toBeTrue();
      expect(detail.adminContact.role).toBe('Company admin');
      expect(detail.subscription.plan).toBe('Growth');
    });
    const req = httpMock.expectOne(`${environment.api_url}/admin/companies/CO-20`);
    req.flush('missing', { status: 404, statusText: 'Not Found' });
    expect(name).toBe("Lola's Table");
  });

  it('does not invent a company when the detail call fails for an unknown id', () => {
    let failed = false;
    service.getCompanyDetail('CO-missing').subscribe({
      next: () => fail('expected the missing company to surface'),
      error: () => { failed = true; },
    });
    const req = httpMock.expectOne(`${environment.api_url}/admin/companies/CO-missing`);
    req.flush('missing', { status: 404, statusText: 'Not Found' });
    expect(failed).toBeTrue();
  });

  it('does not treat a company list payload as a detail', () => {
    let name = '';
    service.getCompanyDetail('CO-22').subscribe(detail => {
      name = detail.companyName;
      expect(detail.fromFixture).toBeTrue();
      expect(detail.subscription.plan).toBe('Premium');
    });
    const req = httpMock.expectOne(`${environment.api_url}/admin/companies/CO-22`);
    req.flush({ data: { items: [{ company_id: 'CO-22', company_name: 'Northline Logistics' }], total: 1 } });
    expect(name).toBe('Northline Logistics');
  });

  it('soft-unpublishes a job with POST and does not send a delete', () => {
    service.unpublishJob('JB-1').subscribe();
    const req = httpMock.expectOne(`${environment.api_url}/admin/jobs/JB-1/unpublish`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ data: { status: 'unpublished' } });
  });
});
