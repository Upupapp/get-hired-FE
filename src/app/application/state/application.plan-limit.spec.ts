import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';
import { ApplicationService } from '../application.service';
import * as ApplicationActions from './application.actions';
import { ApplicationEffects } from './application.effects';
import { CANDIDATE_REFUSAL, httpFailure } from '../../../testing/plan-limit-refusal.fixture';

/** B5 / A3.1: a job not taking applications, as the apply effect passes it to the page. */
describe('ApplicationEffects -- a job that is not taking applications (B5, A3.1)', () => {
  let actions$: Observable<Action>;
  let service: jasmine.SpyObj<ApplicationService>;

  function outcomeOf(failure: unknown): Action {
    service = jasmine.createSpyObj<ApplicationService>('ApplicationService', ['submitApplication']);
    service.submitApplication.and.returnValue(throwError(failure));
    TestBed.configureTestingModule({
      providers: [ApplicationEffects, provideMockActions(() => actions$), { provide: ApplicationService, useValue: service }],
    });
    actions$ = of(ApplicationActions.submitApplication({ application: { jobId: 'JOB-1' } as any }));
    let out: Action | undefined;
    TestBed.inject(ApplicationEffects).submitApplication$.subscribe(action => out = action);
    return out!;
  }

  it('A3.1\'s HTTP 400 refusal reaches the page as its own message and neutral code, and nothing else', () => {
    expect(outcomeOf(httpFailure(400, CANDIDATE_REFUSAL))).toEqual(ApplicationActions.submitApplicationFail({
      payload: CANDIDATE_REFUSAL.error,
      errorCode: 'JOB_NOT_ACCEPTING_APPLICATIONS',
    }));
  });

  it('any other 400 keeps the generic path', () => {
    expect(outcomeOf(httpFailure(400, { error: 'Invalid resume file.' }))).toEqual(ApplicationActions.submitApplicationFail({
      payload: 'Invalid resume file.',
      errorCode: null,
    }));
  });
});
