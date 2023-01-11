import {
	GroupAction,
	GroupActionTypes

} from '../actions/group.action';

// Create new interface for reducer
export interface GroupState {
  groupList: any;
	contactGroupList:any;
	pending: any;
	error: any;
	success: any;
	editGroupRes: any;
	deleteGroupRes: any;
}

// Set initial state of the data
export const GROUP_INITIAL_STATE: GroupState = {
  groupList: [],
	contactGroupList: [],
	pending: false,
	error: null,
	success: null,
	editGroupRes: null,
	deleteGroupRes: null
}

/*
	Create Reducer
	Take 2 Parameter: from Event
	@param
		state: value (event, pending, error)
		action: from action type
*/
export const GroupReducer = (
	state: GroupState = GROUP_INITIAL_STATE,
	action: GroupAction,
	): GroupState => {
		switch (action.type){

            case GroupActionTypes.GET_GROUP_LIST:
            return { ...state, pending: true };

            case GroupActionTypes.GET_GROUP_LIST_SUCCESS:
            return { ...state, groupList: action.payload, pending: false }

            case GroupActionTypes.GET_GROUP_LIST_FAIL:
            return { ...state, pending: false, error: action.payload }

			case GroupActionTypes.GET_CONTACT_GROUP_LIST:
			return { ...state, pending: true };

			case GroupActionTypes.GET_CONTACT_GROUP_LIST_SUCCESS:
			return { ...state, contactGroupList: action.payload, pending: false }

			case GroupActionTypes.GET_CONTACT_GROUP_LIST_FAIL:
			return { ...state, pending: false, error: action.payload }

			case GroupActionTypes.SAVE_GROUP:
			return { ...state, pending: true };

			case GroupActionTypes.SAVE_GROUP_SUCCESS:
			return { ...state, success: action.payload.status, pending: false }

			case GroupActionTypes.SAVE_GROUP_FAIL:
			return { ...state, pending: false, error: action.payload }

			case GroupActionTypes.EDIT_GROUP:
			return { ...state, pending: true };

			case GroupActionTypes.EDIT_GROUP_SUCCESS:
			return { ...state, editGroupRes: action.payload, pending: false }

			case GroupActionTypes.EDIT_GROUP_FAIL:
			return { ...state, pending: false, error: action.payload }

			case GroupActionTypes.DELETE_GROUP:
			return { ...state, pending: true };

			case GroupActionTypes.DELETE_GROUP_SUCCESS:
			return { ...state, deleteGroupRes: action.payload, pending: false }

			case GroupActionTypes.DELETE_GROUP_FAIL:
			return { ...state, pending: false, error: action.payload }

            default:
			return state;
        }
    }
