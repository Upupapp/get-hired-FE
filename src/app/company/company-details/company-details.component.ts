import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { Job, jobLists } from '@main/shared/models/job-list-model-interface';
import { CompanyFacade } from '../state/company.facade';

@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss'],
  animations: [mainAnimations]
})
export class CompanyDetailsComponent implements OnInit {

  company$ = this.companyFacade.companyDetails$;
  latestjobs: Job[] = jobLists;

  constructor(
    private companyFacade: CompanyFacade
  ) { }

  ngOnInit(): void {
    this.companyFacade.getCompany('');
  }

}
