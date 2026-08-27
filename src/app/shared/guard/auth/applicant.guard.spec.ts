import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ApplicantGuard } from './applicant.guard';

describe('ApplicantGuard', () => {
  let guard: ApplicantGuard;

  beforeEach(() => {
    // These reach HttpClient through AdminService -> BaseService, and the guards
    // additionally navigate, so both test modules are required.
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    guard = TestBed.inject(ApplicantGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
