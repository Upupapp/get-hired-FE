import { 
	CandidateAction,
	CandidateActionTypes
	
} from '../actions/candidate.action';

// Create new interface for reducer
export interface CandidateState {
    candidateList: any;
    candidateRes: any;
	pending: any;
	error: any;
	success: any;
    jobId: any;
}

// Set initial state of the data
export const CANDIDATE_INITIAL_STATE: CandidateState = {
    candidateList: [],
    candidateRes: null,
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
export const CandidateReducer = (
	state: CandidateState = CANDIDATE_INITIAL_STATE,
	action: CandidateAction,
	): CandidateState => {
		switch (action.type){

            case CandidateActionTypes.GET_CANDIDATE_LIST:
            return { ...state, pending: true };

            case CandidateActionTypes.GET_CANDIDATE_LIST_SUCCESS:
            return { ...state, candidateList: action.payload, pending: false }

            case CandidateActionTypes.GET_CANDIDATE_LIST_FAIL:
            return { ...state, pending: false, error: action.payload }

            case CandidateActionTypes.GET_CANDIDATE_JOB:
            return { ...state, pending: true };

            case CandidateActionTypes.GET_CANDIDATE_JOB_SUCCESS:
            return { ...state, jobId: action.payload, pending: false }

            case CandidateActionTypes.GET_CANDIDATE_JOB_FAIL:
            return { ...state, pending: false, error: action.payload }

            case CandidateActionTypes.SAVE_CANDIDATE:
            return { ...state, pending: true };

            case CandidateActionTypes.SAVE_CANDIDATE_SUCCESS:
            return { ...state, candidateRes: action.payload, pending: false }

            case CandidateActionTypes.SAVE_CANDIDATE_FAIL:
            return { ...state, pending: false, error: action.payload }

            case CandidateActionTypes.SAVE_CANDIDATE_MULTIPLE:
            return { ...state, pending: true };

            case CandidateActionTypes.SAVE_CANDIDATE_MULTIPLE_SUCCESS:
            return { ...state, candidateRes: action.payload, pending: false }

            case CandidateActionTypes.SAVE_CANDIDATE_MULTIPLE_FAIL:
            return { ...state, pending: false, error: action.payload }

            default:
			return state;
        }
    }