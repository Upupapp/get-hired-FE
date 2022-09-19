import { TestBed } from '@angular/core/testing';

import { ApplicantGuard } from './applicant.guard';

describe('ApplicantGuard', () => {
  let guard: ApplicantGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ApplicantGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
