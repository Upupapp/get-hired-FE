import { 
	GroupAction,
	GroupActionTypes
	
} from '../actions/group.action';

// Create new interface for reducer
export interface GroupState {
    groupList: any;
	pending: any;
	error: any;
	success: any;
}

// Set initial state of the data
export const GROUP_INITIAL_STATE: GroupState = {
    groupList: [],
	pending: false,
	error: null,
	success: null,
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

            default:
			return state;
        }
    }