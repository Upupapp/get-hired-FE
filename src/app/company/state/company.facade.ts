import { Injectable } from "@angular/core";
import * as Model from '../company.model';
import { State } from './company.reducer';
import { select, Store } from "@ngrx/store";
import * as CompanyAction from './company.actions';
import * as fromfeature from './company.selector';

@Injectable()
export class CompanyFacade {
    loading$ = this.store.pipe(select(fromfeature.loading));
    companyDetails$ = this.store.pipe(select(fromfeature.getCompanyDetails));
    companyList$ = this.store.pipe(select(fromfeature.getCompanyList));
    success$ = this.store.pipe(select(fromfeature.getSuccessMsg));
    dashboard$ = this.store.pipe(select(fromfeature.companyDashboard));
    users$ = this.store.pipe(select(fromfeature.getCompanyUsers));
    setup$ = this.store.pipe(select(fromfeature.getSetupList));
    industry$ = this.store.pipe(select(fromfeature.getIndustryList));
    subsRestrictions$ = this.store.pipe(select(fromfeature.getCompanySubscription));
    error$ = this.store.pipe(select(fromfeature.getError));

    constructor(
      private store: Store<State>,
      ) { }

    resetStateNotif() {
      this.store.dispatch(CompanyAction.resetState());
    }

    getAllCompany() {
      this.store.dispatch(CompanyAction.getAllcompany());
    }

    createInitialCompany(companyName: string, companyEmail: string) {
      this.store.dispatch(CompanyAction.createInitialCompany({ companyName, companyEmail }));
    }

    createCompany(company: Model.Company) {
      this.store.dispatch(CompanyAction.createCompany({ company }));
    }

    updateCompany(company: Model.Company) {
      this.store.dispatch(CompanyAction.updateCompany({ company }));
    }

    getCompany(companyId?: string) {
      this.store.dispatch(CompanyAction.getCompany({ companyId }));
    }

    getCompanyDashboard() {
      this.store.dispatch(CompanyAction.companyDashboard());
    }

    getCompanyUsers(companyId: string) {
      this.store.dispatch(CompanyAction.getCompanyUsers({ companyId }));
    }

    getCompanySubscription(companyId: string) {
      this.store.dispatch(CompanyAction.getCompanySubscription({ companyId }));
    }

    getIndustry() {
      this.store.dispatch(CompanyAction.getIndustryList());
    }

    getSetup() {
      this.store.dispatch(CompanyAction.getSetupList());
    }
}
