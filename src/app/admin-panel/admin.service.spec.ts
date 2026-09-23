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
      `${environment.api_url}/admin/jobs?q=chef&status=published&page=1&pageSize=25`
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

  it('soft-unpublishes a job with POST and does not send a delete', () => {
    service.unpublishJob('JB-1').subscribe();
    const req = httpMock.expectOne(`${environment.api_url}/admin/jobs/JB-1/unpublish`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ data: { status: 'unpublished' } });
  });
});
