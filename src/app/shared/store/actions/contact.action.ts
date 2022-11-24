import { Action } from '@ngrx/store';
/* FOR CONTACTS  */

export const enum ContactActionTypes {
    GET_CONTACT_LIST = '[Contacts] Get Contact list', 
	GET_CONTACT_LIST_SUCCESS = '[Contacts] Get Contact list Success', 
	GET_CONTACT_LIST_FAIL = '[Contacts] Get Contact list Fail',

	GET_CONTACT_JOB = '[Contacts] Get Contact Job ID', 
	GET_CONTACT_JOB_SUCCESS = '[Contacts] Get Contact Job ID Success', 
	GET_CONTACT_JOB_FAIL = '[Contacts] Get Contact Job ID Fail',

    SAVE_CONTACT = '[Contacts] Save Contact', 
	SAVE_CONTACT_SUCCESS = '[Contacts] Save Contact Success', 
	SAVE_CONTACT_FAIL = '[Contacts] Save Contact Fail',

	SAVE_CONTACT_MULTIPLE = '[Contacts] Save Contact Multiple', 
	SAVE_CONTACT_MULTIPLE_SUCCESS = '[Contacts] Save Contact Multiple Success', 
	SAVE_CONTACT_MULTIPLE_FAIL = '[Contacts] Save Contact Multiple Fail',
}

export class GetContactList implements Action {
	public readonly type = ContactActionTypes.GET_CONTACT_LIST;
	constructor(public payload: any) { }
}

export class GetContactListSuccess implements Action {
	public readonly type = ContactActionTypes.GET_CONTACT_LIST_SUCCESS;
	constructor(public payload: any) { }
}

export class GetContactListFail implements Action {
	public readonly type = ContactActionTypes.GET_CONTACT_LIST_FAIL;
	constructor(public payload: any) { }
}

export class GetContactJob implements Action {
	public readonly type = ContactActionTypes.GET_CONTACT_JOB;
	constructor(public payload: any) { }
}

export class GetContactJobSuccess implements Action {
	public readonly type = ContactActionTypes.GET_CONTACT_JOB_SUCCESS;
	constructor(public payload: any) { }
}

export class GetContactJobFail implements Action {
	public readonly type = ContactActionTypes.GET_CONTACT_JOB_FAIL;
	constructor(public payload: any) { }
}

export class SaveContact implements Action {
	public readonly type = ContactActionTypes.SAVE_CONTACT;
	constructor(public payload: any) { }
}

export class SaveContactSuccess implements Action {
	public readonly type = ContactActionTypes.SAVE_CONTACT_SUCCESS;
	constructor(public payload: any) { }
}

export class SaveContactFail implements Action {
	public readonly type = ContactActionTypes.SAVE_CONTACT_FAIL;
	constructor(public payload: any) { }
}

export class SaveContactMultiple implements Action {
	public readonly type = ContactActionTypes.SAVE_CONTACT_MULTIPLE;
	constructor(public payload: any) { }
}

export class SaveContactMultipleSuccess implements Action {
	public readonly type = ContactActionTypes.SAVE_CONTACT_MULTIPLE_SUCCESS;
	constructor(public payload: any) { }
}

export class SaveContactMultipleFail implements Action {
	public readonly type = ContactActionTypes.SAVE_CONTACT_MULTIPLE_FAIL;
	constructor(public payload: any) { }
}


export type ContactAction =
    GetContactList
|   GetContactListSuccess
|   GetContactListFail
|   SaveContact
|   SaveContactSuccess
|   SaveContactFail
|   SaveContactMultiple
|   SaveContactMultipleSuccess
|   SaveContactMultipleFail
|	GetContactJob
|	GetContactJobSuccess
|	GetContactJobFail;