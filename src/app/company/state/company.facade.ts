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

    constructor(
      private store: Store<State>,
      ) { }

    getAllCompany() {
      this.store.dispatch(CompanyAction.getAllcompany());
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
    // getfeatureList() {

    // }

    // getfeatureDetails(featureId: string) {

    // }
}
