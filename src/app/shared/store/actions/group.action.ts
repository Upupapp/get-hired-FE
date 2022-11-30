import { Action } from '@ngrx/store';
/* FOR CONTACTS  */

export const enum GroupActionTypes {
    GET_GROUP_LIST = '[Groups] Get Contact Group list', 
	GET_GROUP_LIST_SUCCESS = '[Groups] Get Contact Group list Success', 
	GET_GROUP_LIST_FAIL = '[Groups] Get Contact Group list Fail',

	GET_CONTACT_GROUP_LIST = '[Contact Group] Get Contact Group list', 
	GET_CONTACT_GROUP_LIST_SUCCESS = '[Contact Group] Get Contact Group list Success', 
	GET_CONTACT_GROUP_LIST_FAIL = '[Contact Group] Get Contact Group list Fail',

	SAVE_GROUP = '[Contact Group] Save Contact Group', 
	SAVE_GROUP_SUCCESS = '[Contact Group] Save Contact Group Success', 
	SAVE_GROUP_FAIL = '[Contact Group] Save Contact Group Fail',
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

export class GetContactGroupList implements Action {
	public readonly type = GroupActionTypes.GET_CONTACT_GROUP_LIST;
	constructor(public payload: any) { }
}

export class GetContactGroupListSuccess implements Action {
	public readonly type = GroupActionTypes.GET_CONTACT_GROUP_LIST_SUCCESS;
	constructor(public payload: any) { }
}

export class GetContactGroupListFail implements Action {
	public readonly type = GroupActionTypes.GET_CONTACT_GROUP_LIST_FAIL;
	constructor(public payload: any) { }
}

export class SaveGroup implements Action {
	public readonly type = GroupActionTypes.SAVE_GROUP;
	constructor(public payload: any) { }
}

export class SaveGroupSuccess implements Action {
	public readonly type = GroupActionTypes.SAVE_GROUP_SUCCESS;
	constructor(public payload: any) { }
}

export class SaveGroupFail implements Action {
	public readonly type = GroupActionTypes.SAVE_GROUP_FAIL;
	constructor(public payload: any) { }
}

export type GroupAction =
    GetGroupList
|   GetGroupListSuccess
|   GetGroupListFail
|	GetContactGroupList
|   GetContactGroupListSuccess
|   GetContactGroupListFail
|	SaveGroup
|	SaveGroupSuccess
|	SaveGroupFail;