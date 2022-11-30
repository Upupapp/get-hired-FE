import { 
	ContactAction,
	ContactActionTypes
	
} from '../actions/contact.action';

// Create new interface for reducer
export interface ContactState {
    contactList: any;
    contactRes: any;
    editContactRes: any;
    deleteContactRes: any;
	pending: any;
	error: any;
	success: any;
    jobId: any;
}

// Set initial state of the data
export const CONTACT_INITIAL_STATE: ContactState = {
    contactList: [],
    contactRes: null,
    editContactRes: null,
    deleteContactRes: null,
	pending: false,
	error: null,
	success: null,
    jobId: []
}

/*
	Create Reducer
	Take 2 Parameter: from Event 
	@param 
		state: value (event, pending, error)
		action: from action type
*/
export const ContactReducer = (
	state: ContactState = CONTACT_INITIAL_STATE,
	action: ContactAction,
	): ContactState => {
		switch (action.type){

            case ContactActionTypes.GET_CONTACT_LIST:
            return { ...state, pending: true };

            case ContactActionTypes.GET_CONTACT_LIST_SUCCESS:
            return { ...state, contactList: action.payload, pending: false }

            case ContactActionTypes.GET_CONTACT_LIST_FAIL:
            return { ...state, pending: false, error: action.payload }

            case ContactActionTypes.GET_CONTACT_JOB:
            return { ...state, pending: true };

            case ContactActionTypes.GET_CONTACT_JOB_SUCCESS:
            return { ...state, jobId: action.payload, pending: false }

            case ContactActionTypes.GET_CONTACT_JOB_FAIL:
            return { ...state, pending: false, error: action.payload }

            case ContactActionTypes.SAVE_CONTACT:
            return { ...state, pending: true };

            case ContactActionTypes.SAVE_CONTACT_SUCCESS:
            return { ...state, contactRes: action.payload, pending: false }

            case ContactActionTypes.SAVE_CONTACT_FAIL:
            return { ...state, pending: false, error: action.payload }

            case ContactActionTypes.SAVE_CONTACT_MULTIPLE:
            return { ...state, pending: true };

            case ContactActionTypes.SAVE_CONTACT_MULTIPLE_SUCCESS:
            return { ...state, contactRes: action.payload, pending: false }

            case ContactActionTypes.SAVE_CONTACT_MULTIPLE_FAIL:
            return { ...state, pending: false, error: action.payload }

            case ContactActionTypes.EDIT_CONTACT:
            return { ...state, pending: true };

            case ContactActionTypes.EDIT_CONTACT_SUCCESS:
            return { ...state, editContactRes: action.payload, pending: false }

            case ContactActionTypes.EDIT_CONTACT_FAIL:
            return { ...state, pending: false, error: action.payload }

            case ContactActionTypes.DELETE_CONTACT:
            return { ...state, pending: true };

            case ContactActionTypes.DELETE_CONTACT_SUCCESS:
            return { ...state, deleteContactRes: action.payload, pending: false }

            case ContactActionTypes.DELETE_CONTACT_FAIL:
            return { ...state, pending: false, error: action.payload }

            default:
			return state;
        }
    }