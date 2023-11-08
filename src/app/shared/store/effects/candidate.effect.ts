import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { Actions, ofType, createEffect } from '@ngrx/effects';

//import enum action types
import { CandidateActionTypes } from '../actions/candidate.action';
import { CandidateService } from '../../services/api/candidates.service';

@Injectable()
export class CandidateEffect {
  constructor(
    private candidateService: CandidateService,
    private actions$: Actions
  ) {}

public getCandidateList = createEffect(() =>
    this.actions$.pipe(
        // set type
        ofType(CandidateActionTypes.GET_CANDIDATE_LIST),
        // switch to a new observable and cancel previous subscription
        switchMap((data: any) => {
        return this.candidateService.getCandidateList(data).pipe(
            // return payload
            map((result: any) => {
            return {
                type: CandidateActionTypes.GET_CANDIDATE_LIST_SUCCESS,
                payload: result,
            };
            }),
            catchError((error: any) =>
            // error handler
            of({
                type: CandidateActionTypes.GET_CANDIDATE_LIST_FAIL,
                payload: error,
            })
            )
        );
        })
    )
);

public getCandidateJob = createEffect(() =>
    this.actions$.pipe(
        // set type
        ofType(CandidateActionTypes.GET_CANDIDATE_JOB),
        // switch to a new observable and cancel previous subscription
        switchMap((data: any) => {
        return this.candidateService.getPublishedJob(data).pipe(
            // return payload
            map((result: any) => {
            return {
                type: CandidateActionTypes.GET_CANDIDATE_JOB_SUCCESS,
                payload: result,
            };
            }),
            catchError((error: any) =>
            // error handler
            of({
                type: CandidateActionTypes.GET_CANDIDATE_JOB_FAIL,
                payload: error,
            })
            )
        );
        })
    )
);

public saveCandidate = createEffect(() =>
    this.actions$.pipe(
        // set type
        ofType(CandidateActionTypes.SAVE_CANDIDATE),
        // switch to a new observable and cancel previous subscription
        switchMap((data: any) => {
        return this.candidateService.AddCandidate(data?.payload).pipe(
            // return payload
            map((result: any) => {
            return {
                type: CandidateActionTypes.SAVE_CANDIDATE_SUCCESS,
                payload: result,
            };
            }),
            catchError((error: any) =>
            // error handler
            of({
                type: CandidateActionTypes.SAVE_CANDIDATE_FAIL,
                payload: error,
            })
            )
        );
        })
    )
);

public saveCandidateMultiple = createEffect(() =>
  this.actions$.pipe(
    // set type
    ofType(CandidateActionTypes.SAVE_CANDIDATE_MULTIPLE),
    // switch to a new observable and cancel previous subscription
    switchMap((data: any) => {
      return this.candidateService.AddMultipleCandidate(data?.payload).pipe(
        // return payload
        map((result: any) => {
          return {
            type: CandidateActionTypes.SAVE_CANDIDATE_MULTIPLE_SUCCESS,
            payload: result,
          };
        }),
        catchError((error: any) =>
          // error handler
          of({
            type: CandidateActionTypes.SAVE_CANDIDATE_MULTIPLE_FAIL,
            payload: error,
          })
        )
      );
    })
  )
);

}
