import { Component, OnInit } from '@angular/core';
import { CompanyFacade } from '../state/company.facade';
import * as Model from '../company.model';

@Component({
  selector: 'app-company-dashboard',
  templateUrl: './company-dashboard.component.html',
  styleUrls: ['./company-dashboard.component.scss']
})
export class CompanyDashboardComponent implements OnInit {
  company: Model.Company;
  stat: any;
  charts: any;

  dashboard$ = this.companyFacade.dashboard$;

  constructor(
    private companyFacade: CompanyFacade
  ) { }

  ngOnInit(): void {
    this.companyFacade.getCompanyDashboard();
  }

}
