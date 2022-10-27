import { Injectable } from "@angular/core";
import { select, Store } from "@ngrx/store";
import { State } from './app.reducer';
import * as fromApp from '@main/state/app.selector';
import * as Actions from './app.actions';

@Injectable({
  providedIn: 'root'
})
export class AppFacade {

  credentials$ = this.store.pipe(select(fromApp.getAuthCredentials));

  constructor(private store: Store<State>) { }


  refreshCredentials(email: string) {
    this.store.dispatch(Actions.refreshAuthCredentials({ email }));
  }

  resetCredentials() {
    this.store.dispatch(Actions.resetAuthCredentials());
  }
}
