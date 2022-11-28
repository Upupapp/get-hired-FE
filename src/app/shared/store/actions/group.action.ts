import { Action } from '@ngrx/store';
/* FOR CONTACTS  */

export const enum GroupActionTypes {
    GET_GROUP_LIST = '[Groups] Get Contact Group list', 
	GET_GROUP_LIST_SUCCESS = '[Groups] Get Contact Group list Success', 
	GET_GROUP_LIST_FAIL = '[Groups] Get Contact Group list Fail',
}

export class GetGroupList implements Action {
	public readonly type = GroupActionTypes.GET_GROUP_LIST;
	constructor(public payload: any) { }
}

export class GetGroupListSuccess implements Action {
	public readonly type = GroupActionTypes.GET_GROUP_LIST_SUCCESS;
	constructor(public payload: any) { }
}

export class GetGroupListFail implements Action {
	public readonly type = GroupActionTypes.GET_GROUP_LIST_FAIL;
	constructor(public payload: any) { }
}

export type GroupAction =
    GetGroupList
|   GetGroupListSuccess
|   GetGroupListFail;