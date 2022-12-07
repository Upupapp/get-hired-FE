import { 
	CompanyAction,
	CompanyActionTypes
	
} from '../actions/company.action';

// Create new interface for reducer
export interface CompanyState {
    companyUserList: any;
	companyUserRes: any;
	pending: any;
	error: any;
	success: any;
}

// Set initial state of the data
export const COMPANY_INITIAL_STATE: CompanyState = {
    companyUserList: [],
	companyUserRes: null,
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
export const CompanyReducer = (
	state: CompanyState = COMPANY_INITIAL_STATE,
	action: CompanyAction,
	): CompanyState => {
		switch (action.type){

            case CompanyActionTypes.GET_COMPANY_USER_LIST:
            return { ...state, pending: true };

            case CompanyActionTypes.GET_COMPANY_USER_LIST_SUCCESS:
            return { ...state, companyUserList: action.payload, pending: false }

            case CompanyActionTypes.GET_COMPANY_USER_LIST_FAIL:
            return { ...state, pending: false, error: action.payload }

			case CompanyActionTypes.SAVE_COMPANY_USER:
			return { ...state, pending: true };

			case CompanyActionTypes.SAVE_COMPANY_USER_SUCCESS:
			return { ...state, companyUserRes: action.payload, pending: false }

			case CompanyActionTypes.SAVE_COMPANY_USER_FAIL:
			return { ...state, pending: false, error: action.payload }

            default:
			return state;
        }
    }