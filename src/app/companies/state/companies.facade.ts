import { Injectable } from "@angular/core";
import * as Model from '../companies.model';
import { State } from './companies.reducer';
import { select, Store } from "@ngrx/store";
import * as CompanyAction from './companies.actions';
import * as fromfeature from './companies.selector';

@Injectable()
export class CompaniesFacade {
  loading$ = this.store.pipe(select(fromfeature.loading));
  companyDetails$ = this.store.pipe(select(fromfeature.getCompanyDetails));
  companyList$ = this.store.pipe(select(fromfeature.getCompanyList));
  success$ = this.store.pipe(select(fromfeature.getSuccessMsg));

  constructor(
    private store: Store<State>,
  ) { }

  getAllFeaturedCompanies() {
    this.store.dispatch(CompanyAction.getAllFeaturedCompany());
  }

  getCompany(companyId?: string) {
    this.store.dispatch(CompanyAction.getCompany({ companyId }));
  }

  getCompanyBySlug(slug: string) {
    this.store.dispatch(CompanyAction.getCompanyBySlug({ slug }));
  }

  // resetStateNotif() {
  //   this.store.dispatch(CompanyAction.resetState());
  // }

  // getAllCompany() {
  //   this.store.dispatch(CompanyAction.getAllcompany());
  // }

  // createCompany(company: Model.Company) {
  //   this.store.dispatch(CompanyAction.createCompany({ company }));
  // }

  // updateCompany(company: Model.Company) {
  //   this.store.dispatch(CompanyAction.updateCompany({ company }));
  // }



  // getCompanyDashboard() {
  //   this.store.dispatch(CompanyAction.companyDashboard());
  // }
  // getfeatureList() {

  // }

  // getfeatureDetails(featureId: string) {

  // }
}
