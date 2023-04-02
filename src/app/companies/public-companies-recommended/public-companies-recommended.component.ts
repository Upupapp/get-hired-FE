import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from '../companies.model';
import { CompaniesFacade } from '../state/companies.facade';

@Component({
  selector: 'app-public-companies-recommended',
  templateUrl: './public-companies-recommended.component.html',
  styleUrls: ['./public-companies-recommended.component.scss'],
  animations: [mainAnimations]
})
export class PublicCompaniesRecommendedComponent implements OnInit {

  list$ = this.companiesFacade.companyList$;
  loading$ = this.companiesFacade.loading$;

  constructor(
    private companiesFacade: CompaniesFacade
  ) { }

  ngOnInit(): void {
    this.companiesFacade.getAllFeaturedCompanies();
  }

}
