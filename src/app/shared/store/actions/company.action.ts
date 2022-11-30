import { Action } from '@ngrx/store';
/* FOR CONTACTS  */

export const enum CompanyActionTypes {
    GET_COMPANY_USER_LIST = '[Company] Get Company User list', 
	GET_COMPANY_USER_LIST_SUCCESS = '[Company] Get Company User list Success', 
	GET_COMPANY_USER_LIST_FAIL = '[Company] Get Company User list Fail',

	SAVE_COMPANY_USER = '[Company] Save Company User', 
	SAVE_COMPANY_USER_SUCCESS = '[Company] Save Company User Success', 
	SAVE_COMPANY_USER_FAIL = '[Company] Save Company User Fail',
}

export class GetCompanyUserList implements Action {
	public readonly type = CompanyActionTypes.GET_COMPANY_USER_LIST;
	constructor(public payload: any) { }
}

export class GetCompanyUserListSuccess implements Action {
	public readonly type = CompanyActionTypes.GET_COMPANY_USER_LIST_SUCCESS;
	constructor(public payload: any) { }
}

export class GetCompanyUserListFail implements Action {
	public readonly type = CompanyActionTypes.GET_COMPANY_USER_LIST_FAIL;
	constructor(public payload: any) { }
}

export class SaveCompanyUser implements Action {
	public readonly type = CompanyActionTypes.SAVE_COMPANY_USER;
	constructor(public payload: any) { }
}

export class SaveCompanyUserSuccess implements Action {
	public readonly type = CompanyActionTypes.SAVE_COMPANY_USER_SUCCESS;
	constructor(public payload: any) { }
}

export class SaveCompanyUserFail implements Action {
	public readonly type = CompanyActionTypes.SAVE_COMPANY_USER_FAIL;
	constructor(public payload: any) { }
}

export type CompanyAction =
    GetCompanyUserList
|   GetCompanyUserListSuccess
|   GetCompanyUserListFail
|	SaveCompanyUser
|	SaveCompanyUserSuccess
|	SaveCompanyUserFail;