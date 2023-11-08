import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { Actions, ofType, createEffect } from '@ngrx/effects';

//import enum action types
import { ContactActionTypes } from '../actions/contact.action';
import { ContactService } from '../../services/api/contacts.service';

@Injectable()
export class ContactEffect {
  constructor(
    private contactService: ContactService,
    private actions$: Actions
  ) {}

public getContactList = createEffect(() =>
    this.actions$.pipe(
        // set type
        ofType(ContactActionTypes.GET_CONTACT_LIST),
        // switch to a new observable and cancel previous subscription
        switchMap((data: any) => {
        return this.contactService.getContactList(data).pipe(
            // return payload
            map((result: any) => {
            return {
                type: ContactActionTypes.GET_CONTACT_LIST_SUCCESS,
                payload: result,
            };
            }),
            catchError((error: any) =>
            // error handler
            of({
                type: ContactActionTypes.GET_CONTACT_LIST_FAIL,
                payload: error,
            })
            )
        );
        })
    )
);

public getContactJob = createEffect(() =>
    this.actions$.pipe(
        // set type
        ofType(ContactActionTypes.GET_CONTACT_JOB),
        // switch to a new observable and cancel previous subscription
        switchMap((data: any) => {
        return this.contactService.getPublishedJob(data).pipe(
            // return payload
            map((result: any) => {
            return {
                type: ContactActionTypes.GET_CONTACT_JOB_SUCCESS,
                payload: result,
            };
            }),
            catchError((error: any) =>
            // error handler
            of({
                type: ContactActionTypes.GET_CONTACT_JOB_FAIL,
                payload: error,
            })
            )
        );
        })
    )
);

public saveContact = createEffect(() =>
    this.actions$.pipe(
        // set type
        ofType(ContactActionTypes.SAVE_CONTACT),
        // switch to a new observable and cancel previous subscription
        switchMap((data: any) => {
        return this.contactService.AddContact(data?.payload).pipe(
            // return payload
            map((result: any) => {
            return {
                type: ContactActionTypes.SAVE_CONTACT_SUCCESS,
                payload: result,
            };
            }),
            catchError((error: any) =>
            // error handler
            of({
                type: ContactActionTypes.SAVE_CONTACT_FAIL,
                payload: error,
            })
            )
        );
        })
    )
);

public editContact = createEffect(() =>
    this.actions$.pipe(
        // set type
        ofType(ContactActionTypes.EDIT_CONTACT),
        // switch to a new observable and cancel previous subscription
        switchMap((data: any) => {
        return this.contactService.editContact(data?.payload).pipe(
            // return payload
            map((result: any) => {
            return {
                type: ContactActionTypes.EDIT_CONTACT_SUCCESS,
                payload: result,
            };
            }),
            catchError((error: any) =>
            // error handler
            of({
                type: ContactActionTypes.EDIT_CONTACT_FAIL,
                payload: error,
            })
            )
        );
        })
    )
);

public deleteContact = createEffect(() =>
    this.actions$.pipe(
        // set type
        ofType(ContactActionTypes.DELETE_CONTACT),
        // switch to a new observable and cancel previous subscription
        switchMap((data: any) => {
        return this.contactService.deleteContact(data?.payload).pipe(
            // return payload
            map((result: any) => {
            return {
                type: ContactActionTypes.DELETE_CONTACT_SUCCESS,
                payload: result,
            };
            }),
            catchError((error: any) =>
            // error handler
            of({
                type: ContactActionTypes.DELETE_CONTACT_FAIL,
                payload: error,
            })
            )
        );
        })
    )
);



public saveContactMultiple = createEffect(() =>
  this.actions$.pipe(
    // set type
    ofType(ContactActionTypes.SAVE_CONTACT_MULTIPLE),
    // switch to a new observable and cancel previous subscription
    switchMap((data: any) => {
      return this.contactService.AddMultipleContact(data?.payload).pipe(
        // return payload
        map((result: any) => {
          return {
            type: ContactActionTypes.SAVE_CONTACT_MULTIPLE_SUCCESS,
            payload: result,
          };
        }),
        catchError((error: any) =>
          // error handler
          of({
            type: ContactActionTypes.SAVE_CONTACT_MULTIPLE_FAIL,
            payload: error,
          })
        )
      );
    })
  )
);

}
