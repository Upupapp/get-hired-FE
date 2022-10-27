import { authReducer, AuthState } from "./auth/state/auth.reducer";
import * as Model from './app.model'
import { credentialReducer } from "./state/app.reducer";

export interface State {
  credentials: Model.Credentials
  status?: AuthState
}

export const appReducer = {
  auth: credentialReducer,
  status: authReducer
};
