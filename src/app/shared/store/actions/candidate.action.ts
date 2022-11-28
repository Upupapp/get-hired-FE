import { Action } from '@ngrx/store';
/* FOR CONTACTS  */

export const enum CandidateActionTypes {
    GET_CANDIDATE_LIST = '[Candidate] Get Candidate list', 
	GET_CANDIDATE_LIST_SUCCESS = '[Candidate] Get Candidate list Success', 
	GET_CANDIDATE_LIST_FAIL = '[Candidate] Get Candidate list Fail',

	GET_CANDIDATE_JOB = '[Candidate] Get Candidate Job ID', 
	GET_CANDIDATE_JOB_SUCCESS = '[Candidate] Get Candidate Job ID Success', 
	GET_CANDIDATE_JOB_FAIL = '[Candidate] Get Candidate Job ID Fail',

    SAVE_CANDIDATE = '[Candidate] Save Candidate', 
	SAVE_CANDIDATE_SUCCESS = '[Candidate] Save Candidate Success', 
	SAVE_CANDIDATE_FAIL = '[Candidate] Save Candidate Fail',

	SAVE_CANDIDATE_MULTIPLE = '[Candidate] Save Candidate Multiple', 
	SAVE_CANDIDATE_MULTIPLE_SUCCESS = '[Candidate] Save Candidate Multiple Success', 
	SAVE_CANDIDATE_MULTIPLE_FAIL = '[Candidate] Save Candidate Multiple Fail',
}

export class GetCandidateList implements Action {
	public readonly type = CandidateActionTypes.GET_CANDIDATE_LIST;
	constructor(public payload: any) { }
}

export class GetCandidateListSuccess implements Action {
	public readonly type = CandidateActionTypes.GET_CANDIDATE_LIST_SUCCESS;
	constructor(public payload: any) { }
}

export class GetCandidateListFail implements Action {
	public readonly type = CandidateActionTypes.GET_CANDIDATE_LIST_FAIL;
	constructor(public payload: any) { }
}

export class GetCandidateJob implements Action {
	public readonly type = CandidateActionTypes.GET_CANDIDATE_JOB;
	constructor(public payload: any) { }
}

export class GetCandidateJobSuccess implements Action {
	public readonly type = CandidateActionTypes.GET_CANDIDATE_JOB_SUCCESS;
	constructor(public payload: any) { }
}

export class GetCandidateJobFail implements Action {
	public readonly type = CandidateActionTypes.GET_CANDIDATE_JOB_FAIL;
	constructor(public payload: any) { }
}

export class SaveCandidate implements Action {
	public readonly type = CandidateActionTypes.SAVE_CANDIDATE;
	constructor(public payload: any) { }
}

export class SaveCandidateSuccess implements Action {
	public readonly type = CandidateActionTypes.SAVE_CANDIDATE_SUCCESS;
	constructor(public payload: any) { }
}

export class SaveCandidateFail implements Action {
	public readonly type = CandidateActionTypes.SAVE_CANDIDATE_FAIL;
	constructor(public payload: any) { }
}

export class SaveCandidateMultiple implements Action {
	public readonly type = CandidateActionTypes.SAVE_CANDIDATE_MULTIPLE;
	constructor(public payload: any) { }
}

export class SaveCandidateMultipleSuccess implements Action {
	public readonly type = CandidateActionTypes.SAVE_CANDIDATE_MULTIPLE_SUCCESS;
	constructor(public payload: any) { }
}

export class SaveCandidateMultipleFail implements Action {
	public readonly type = CandidateActionTypes.SAVE_CANDIDATE_MULTIPLE_FAIL;
	constructor(public payload: any) { }
}


export type CandidateAction =
    GetCandidateList
|   GetCandidateListSuccess
|   GetCandidateListFail
|   SaveCandidate
|   SaveCandidateSuccess
|   SaveCandidateFail
|   SaveCandidateMultiple
|   SaveCandidateMultipleSuccess
|   SaveCandidateMultipleFail
|	GetCandidateJob
|	GetCandidateJobSuccess
|	GetCandidateJobFail;