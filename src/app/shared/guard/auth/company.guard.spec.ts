import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CompanyGuard } from './company.guard';

describe('CompanyGuard', () => {
  let guard: CompanyGuard;

  beforeEach(() => {
    // These reach HttpClient through AdminService -> BaseService, and the guards
    // additionally navigate, so both test modules are required.
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    guard = TestBed.inject(CompanyGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
