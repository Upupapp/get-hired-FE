import { Action } from '@ngrx/store';
/* FOR CONTACTS  */

export const enum GroupActionTypes {
    GET_GROUP_LIST = '[Groups] Get Contact Group list', 
	GET_GROUP_LIST_SUCCESS = '[Groups] Get Contact Group list Success', 
	GET_GROUP_LIST_FAIL = '[Groups] Get Contact Group list Fail',

	GET_CONTACT_GROUP_LIST = '[Contact Group] Get Contact Group list', 
	GET_CONTACT_GROUP_LIST_SUCCESS = '[Contact Group] Get Contact Group list Success', 
	GET_CONTACT_GROUP_LIST_FAIL = '[Contact Group] Get Contact Group list Fail',

	EDIT_GROUP = '[Groups] Group Contact', 
	EDIT_GROUP_SUCCESS = '[Groups] Group Contact Success', 
	EDIT_GROUP_FAIL = '[Groups] Group Contact Fail',

	DELETE_GROUP = '[Groups] Delete Group', 
	DELETE_GROUP_SUCCESS = '[Groups] Delete Group Success', 
	DELETE_GROUP_FAIL = '[Groups] Delete Group Fail',

	SAVE_GROUP = '[Groups Group] Save Groups Group', 
	SAVE_GROUP_SUCCESS = '[Groups Group] Save Groups Group Success', 
	SAVE_GROUP_FAIL = '[Groups Group] Save Groups Group Fail',
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

export class EditGroup implements Action {
	public readonly type = GroupActionTypes.EDIT_GROUP;
	constructor(public payload: any) { }
}

export class EditGroupSuccess implements Action {
	public readonly type = GroupActionTypes.EDIT_GROUP_SUCCESS;
	constructor(public payload: any) { }
}

export class EditGroupFail implements Action {
	public readonly type = GroupActionTypes.EDIT_GROUP_FAIL;
	constructor(public payload: any) { }
}

export class DeleteGroup implements Action {
	public readonly type = GroupActionTypes.DELETE_GROUP;
	constructor(public payload: any) { }
}

export class DeleteGroupSuccess implements Action {
	public readonly type = GroupActionTypes.DELETE_GROUP_SUCCESS;
	constructor(public payload: any) { }
}

export class DeleteGroupFail implements Action {
	public readonly type = GroupActionTypes.DELETE_GROUP_FAIL;
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
|	SaveGroupFail
|	EditGroup
|	EditGroupSuccess
|	EditGroupFail
|	DeleteGroup
|	DeleteGroupSuccess
|	DeleteGroupFail;
