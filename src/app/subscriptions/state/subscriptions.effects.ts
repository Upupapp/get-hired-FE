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
import * as SubscriptionsActions from './subscriptions.actions';
import * as Model from '../subscriptions.model';
import { SubscriptionsService } from '../subscriptions.service';

@Injectable()
export class SubscriptionsEffects {

  constructor(
    private subscriptionsService: SubscriptionsService,
    private actions$: Actions,
  ) { }

  getAllSubscriptions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SubscriptionsActions.getAllsubscriptions),
      mergeMap(() => this.subscriptionsService.getAllSubscriptions()
        .pipe(
          map((res: any) => {
            const subscriptions: Model.Subscriptions[] = res.data;
            return SubscriptionsActions.getAllsubscriptionsSuccess({ subscriptions });
          }),
          catchError((err) => {
            const { error } = err.error;
            return of(SubscriptionsActions.getAllsubscriptionsFail({ payload: error }))
          })
        )
      )
    );
  });

  // getSubscriptions$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(SubscriptionsActions.getSubscriptions),
  //     mergeMap(() => this.subscriptionsService.getUserSubscriptions()
  //       .pipe(
  //         map((res: any) => {
  //           const subscriptions: Model.Subscriptions = res.data;
  //           return SubscriptionsActions.getSubscriptionsSuccess({ subscriptions });
  //         }),
  //         catchError((err) => {
  //           const { error } = err.error;
  //           return of(SubscriptionsActions.getSubscriptionsFail({ payload: error }))
  //         })
  //       )
  //     )
  //   );
  // });



}
