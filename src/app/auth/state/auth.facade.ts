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
  success$ = this.store.pipe(select(fromAuth.successMsg));
  error$ = this.store.pipe(select(fromAuth.errorMsg));
  credentials$ = this.store.pipe(select(fromAuth.getAuthCredentials));
  profile$ = this.store.pipe(select(fromAuth.getUserProfile));

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

  logout() {
    this.store.dispatch(Actions.resetCredentials());
  }

  getUserProfile() {
    this.store.dispatch(Actions.getUserProfile());
  }

  updateProfile(profile:Model.User) {
    this.store.dispatch(Actions.updateUserProfile({ profile }));
  }
}
