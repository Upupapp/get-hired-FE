import { Injectable } from '@angular/core';
import {
  of
} from 'rxjs';
import {
  catchError,
  map,
  mergeMap
} from 'rxjs/operators';
import {
  Actions,
  ofType,
  createEffect
} from '@ngrx/effects';
import * as Model from '../application.model';
import { ApplicationService } from '../application.service';
import * as ApplicationActions from './application.actions';

@Injectable()
export class ApplicationEffects {

  constructor(
    private applicationService: ApplicationService,
    private actions$: Actions,
  ) { }

  // getPublishedApplication$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(ApplicationActions.getPublishedJobList),
  //     mergeMap((action) => this.jobsService.getPublishedApplication(action.companyId)
  //       .pipe(
  //         map((res: any) => {
  //           const publishedApplication: Model.BasicJob[] = res.data;
  //           return ApplicationActions.getPublishedJobListSuccess({ publishedApplication });
  //         }),
  //         catchError((err) => {
  //           const { error } = err.error;
  //           return of(ApplicationActions.getPublishedJobListFail({ payload: error }))
  //         })
  //       )
  //     )
  //   );
  // });

}
