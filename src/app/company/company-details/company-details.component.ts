import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { CompanyFacade } from '../state/company.facade';

@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss'],
  animations: [mainAnimations]
})
export class CompanyDetailsComponent implements OnInit {

  company$ = this.companyFacade.companyDetails$;

  constructor(
    private companyFacade: CompanyFacade
  ) { }

  ngOnInit(): void {
    this.companyFacade.getCompany('');
  }

}
