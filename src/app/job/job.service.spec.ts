import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JobService } from './job.service';
import { BaseService } from '@main/core/services/base.service';
import { environment } from '@environments/environment';

/**
 * TEST GATE — d3246b6: updateApplicationStatus()
 *
 * Only the NEW method is exercised here. Existing methods already lack
 * coverage and are out of scope for this deployment gate.
 */
describe('JobService -- updateApplicationStatus (d3246b6)', () => {
  let service: JobService;
  let httpMock: HttpTestingController;
  const expectedUrl = `${environment.api_url}/application/status`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BaseService, JobService],
    });
    service = TestBed.inject(JobService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // fail the test if any HTTP request is left un-flushed
  });

  it('sends PUT /application/status with applicationId and newStatusId', () => {
    service.updateApplicationStatus('app-123', 3).subscribe();

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ applicationId: 'app-123', newStatusId: 3 });
    req.flush({});
  });

  it('returns the server response on success', () => {
    const mockResponse = { success: true };
    let result: any;

    service.updateApplicationStatus('app-456', 4).subscribe(r => (result = r));

    const req = httpMock.expectOne(expectedUrl);
    req.flush(mockResponse);

    expect(result).toEqual(mockResponse);
  });

  it('propagates an HTTP error to the subscriber', () => {
    let errorCaught = false;

    service.updateApplicationStatus('app-789', 5).subscribe({
      next: () => fail('expected an error, not a value'),
      error: () => (errorCaught = true),
    });

    const req = httpMock.expectOne(expectedUrl);
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(errorCaught).toBeTrue();
  });

  it('passes status IDs for all picker values (2-Applied through 6-Hired) without modification', () => {
    const statusIds = [2, 3, 4, 5, 6];
    statusIds.forEach(id => {
      service.updateApplicationStatus('app-all', id).subscribe();
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.body.newStatusId).toBe(id);
      req.flush({});
    });
  });
});
