import { Component, OnInit } from '@angular/core';
import { CompanyFacade } from '../state/company.facade';
import * as Model from '../company.model';
import { map } from 'rxjs';

@Component({
  selector: 'app-company-dashboard',
  templateUrl: './company-dashboard.component.html',
  styleUrls: ['./company-dashboard.component.scss']
})
export class CompanyDashboardComponent implements OnInit {
  company: Model.Company;
  stat: any;
  charts: any;

  loading$ = this.companyFacade.loading$;

  dashboard$ = this.companyFacade.dashboard$
    .pipe(
      map(dash => {
        if(dash) {
          console.log(dash);
          return {
            company: dash.company,
            charts: dash.charts,
            graph: {
              graph: dash.graph,
              statistic: dash.statistic,
              jobViews: dash.jobViews
            },
            stat: {
              totalContacts: dash.totalContacts,
              cities: dash.cities
            }
          }
        }
      })
    );

  constructor(
    private companyFacade: CompanyFacade
  ) { }

  ngOnInit(): void {
    this.companyFacade.getCompanyDashboard();
  }

}
