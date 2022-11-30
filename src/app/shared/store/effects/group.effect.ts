import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { Actions, ofType, Effect, createEffect } from '@ngrx/effects';

//import enum action types
import { GroupActionTypes } from '../actions/group.action';
import { GroupService } from '../../services/api/groups.service';

@Injectable()
export class GroupEffect {
  constructor(
    private groupService: GroupService,
    private actions$: Actions
  ) {}

public getGroupList = createEffect(() =>
    this.actions$.pipe(
        // set type
        ofType(GroupActionTypes.GET_GROUP_LIST),
        // switch to a new observable and cancel previous subscription
        switchMap((data: any) => {
        return this.groupService.getGroupList(data).pipe(
            // return payload
            map((result: any) => {
            return {
                type: GroupActionTypes.GET_GROUP_LIST_SUCCESS,
                payload: result,
            };
            }),
            catchError((error: any) =>
            // error handler
            of({
                type: GroupActionTypes.GET_GROUP_LIST_FAIL,
                payload: error,
            })
            )
        );
        })
    )
);

public getContactGroupList = createEffect(() =>
    this.actions$.pipe(
        // set type
        ofType(GroupActionTypes.GET_CONTACT_GROUP_LIST),
        // switch to a new observable and cancel previous subscription
        switchMap((data: any) => {
        return this.groupService.getContactGroupList(data).pipe(
            // return payload
            map((result: any) => {
            return {
                type: GroupActionTypes.GET_CONTACT_GROUP_LIST_SUCCESS,
                payload: result,
            };
            }),
            catchError((error: any) =>
            // error handler
            of({
                type: GroupActionTypes.GET_CONTACT_GROUP_LIST_FAIL,
                payload: error,
            })
            )
        );
        })
    )
);

public saveGroup = createEffect(() =>
this.actions$.pipe(
  // set type
  ofType(GroupActionTypes.SAVE_GROUP),
  // switch to a new observable and cancel previous subscription
  switchMap((data: any) => {
    return this.groupService.addContactGroup(data?.payload)
      .pipe(
        // return payload
        map((result: any) => {
          return {
            type: GroupActionTypes.SAVE_GROUP_SUCCESS,
            payload: result
          };
        }),
        catchError((error: any) =>
          // error handler
          of({
            type: GroupActionTypes.SAVE_GROUP_FAIL,
            payload: error,
          }),
        ),
      );
  }),
),
)


}