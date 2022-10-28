import { Injectable } from "@angular/core";
import { select, Store } from "@ngrx/store";
import * as fromAuth from './auth.selector';
import * as Actions from './auth.actions';
import { State } from './auth.reducer';
import * as Model from '../auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {

  loading$ = this.store.pipe(select(fromAuth.getLoading));
  success$ = this.store.pipe(select(fromAuth.successThrow));
  error$ = this.store.pipe(select(fromAuth.errorMsg));
  credentials$ = this.store.pipe(select(fromAuth.getAuthCredentials));

  constructor(private store: Store<State>) { }

  signUp(credentials: Model.Credentials) {
    this.store.dispatch(Actions.createAuthCredentials({ credentials }));
  }

  signIn(email: string, password: string) {
    const loginCredentials = {
      email, password
    };

    this.store.dispatch(Actions.getAuthCredentials({ loginCredentials }));
  }

}
