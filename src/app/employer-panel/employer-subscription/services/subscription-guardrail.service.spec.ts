import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'environments/environment';
import { SubscriptionGuardrailService } from './subscription-guardrail.service';

describe('SubscriptionGuardrailService', () => {
  let service: SubscriptionGuardrailService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.setItem('token', 'Bearer guardrail-token');
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(SubscriptionGuardrailService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('token');
  });

  it('carries the current Firebase bearer token on the employer summary request', () => {
    service.getSummary().subscribe();
    const req = http.expectOne(`${environment.api_url}/subscriptions/employer/summary`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer guardrail-token');
    req.flush({ success: true, summary: {} });
  });
});
