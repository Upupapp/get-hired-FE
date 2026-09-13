import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Subject, Subscription } from 'rxjs';
import { EngagementRefreshBus } from '@main/shared/engagement/engagement-refresh.bus';
import * as JobActions from './job.actions';
import { JobEffects } from './job.effects';
import { JobService } from '../job.service';

/** F1: closing, archiving, reopening or deleting a job changes the job meter, so the engagement context is read again. */
describe('JobEffects -- a job status change or delete reads the engagement context again (F1)', () => {
  let actions$: Subject<Action>;
  let bus: EngagementRefreshBus;
  let subscription: Subscription;

  beforeEach(() => {
    actions$ = new Subject<Action>();
    TestBed.configureTestingModule({
      providers: [JobEffects, provideMockActions(() => actions$), { provide: JobService, useValue: {} }],
    });
    bus = TestBed.inject(EngagementRefreshBus);
    spyOn(bus, 'request');
    subscription = TestBed.inject(JobEffects).refreshEngagementOnJobChange$.subscribe();
  });

  afterEach(() => subscription.unsubscribe());

  it('a status change that succeeded (close, archive, reopen): one refresh request', () => {
    actions$.next(JobActions.changeJobStatusSuccess({ job: {} as any }));
    expect((bus.request as jasmine.Spy).calls.allArgs()).toEqual([['job_status_changed']]);
  });

  it('a job deleted: one refresh request', () => {
    actions$.next(JobActions.deleteJobSuccess({ basicList: [] }));
    expect((bus.request as jasmine.Spy).calls.allArgs()).toEqual([['job_deleted']]);
  });

  it('a status change asked for or failed: no refresh request', () => {
    actions$.next(JobActions.changeJobStatus({ status: 4, jobId: 'JOB-1' }));
    actions$.next(JobActions.changeJobStatusFail({ payload: {} }));
    expect(bus.request).not.toHaveBeenCalled();
  });
});
