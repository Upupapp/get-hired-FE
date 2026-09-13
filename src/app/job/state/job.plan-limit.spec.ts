import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';
import { JobService } from '../job.service';
import * as JobActions from './job.actions';
import { JobEffects } from './job.effects';
import { jobReducer } from './job.reducer';
import { EMPLOYER_REFUSAL, httpFailure } from '../../../testing/plan-limit-refusal.fixture';

describe('Job state -- a job save refused by a plan limit (B5)', () => {
  let actions$: Observable<Action>;
  let effects: JobEffects;
  let jobService: jasmine.SpyObj<JobService>;

  const PUBLISH_NEW: any = { jobTitle: 'Chef', jobStatusId: 2, jobId: '' };
  const PUBLISH_EXISTING: any = { jobTitle: 'Chef', jobStatusId: 2, jobId: 'JOB-1' };
  const DRAFT: any = { jobTitle: 'Chef', jobStatusId: 1, jobId: '' };

  beforeEach(() => {
    jobService = jasmine.createSpyObj<JobService>('JobService', ['saveJob']);
    TestBed.configureTestingModule({
      providers: [JobEffects, provideMockActions(() => actions$), { provide: JobService, useValue: jobService }],
    });
    effects = TestBed.inject(JobEffects);
  });

  function outcomeOf(job: any): Action {
    actions$ = of(JobActions.saveJob({ job }));
    let out: Action | undefined;
    effects.job$.subscribe(action => out = action);
    return out!;
  }

  it('POST /job/create refused: saveJobRefused carries A3\'s refusal instead of a generic saveJobFail', () => {
    jobService.saveJob.and.returnValue(throwError(httpFailure(402, EMPLOYER_REFUSAL)));
    expect(outcomeOf(PUBLISH_NEW)).toEqual(JobActions.saveJobRefused({ refusal: EMPLOYER_REFUSAL }));
  });

  it('PUT /job/updatejobs refused (going live, or new questions on a live job): the same', () => {
    jobService.saveJob.and.returnValue(throwError(httpFailure(402, EMPLOYER_REFUSAL)));
    expect(outcomeOf(PUBLISH_EXISTING)).toEqual(JobActions.saveJobRefused({ refusal: EMPLOYER_REFUSAL }));
  });

  it('any other failure keeps its existing message', () => {
    jobService.saveJob.and.returnValue(throwError(httpFailure(500, { error: 'Database unavailable' })));
    expect(outcomeOf(PUBLISH_NEW)).toEqual(JobActions.saveJobFail({ payload: 'Database unavailable' }));
  });

  it('drafts still save: a draft save passes straight through to saveJobSuccess', () => {
    const saved: any = { ...DRAFT, jobId: 'JOB-9' };
    jobService.saveJob.and.returnValue(of({ data: saved }));
    expect(outcomeOf(DRAFT)).toEqual(JobActions.saveJobSuccess({ job: saved }));
    expect(jobService.saveJob).toHaveBeenCalledOnceWith(DRAFT);
  });

  it('the reducer stops loading and keeps the refusal for the page, with no error text', () => {
    const saving = jobReducer(undefined, JobActions.saveJob({ job: PUBLISH_NEW }));
    expect(saving.loading).toBeTrue();
    const refused = jobReducer(saving, JobActions.saveJobRefused({ refusal: EMPLOYER_REFUSAL }));
    expect(refused.loading).toBeFalse();
    expect(refused.planLimitRefusal).toEqual(EMPLOYER_REFUSAL);
    expect(refused.error).toBeNull();
  });

  it('the next save attempt, and an explicit clear, both drop the refusal', () => {
    const refused = jobReducer(undefined, JobActions.saveJobRefused({ refusal: EMPLOYER_REFUSAL }));
    expect(jobReducer(refused, JobActions.saveJob({ job: DRAFT })).planLimitRefusal).toBeNull();
    expect(jobReducer(refused, JobActions.clearPlanLimitRefusal()).planLimitRefusal).toBeNull();
  });
});
