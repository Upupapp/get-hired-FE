import * as contact from './reducers/contact.reducer';
import * as group from './reducers/group.reducer';

export interface StoreState {
    contact: contact.ContactState;
    group: group.GroupState;
}

export const INITIAL_STATE: StoreState = {
    contact: contact.CONTACT_INITIAL_STATE,
    group: group.GROUP_INITIAL_STATE,
};

export function clearState(reducer: any) {
    return function (state: any, action: any) {
      // if (action.type === AuthActionTypes.LOGOUT) {
      //   state = INITIAL_STATE;
      // }
  
      return reducer(state, action);
    };
  }
  
  export const routerStateConfig = {
    stateKey: 'router', // state-slice name for routing state
  };
  