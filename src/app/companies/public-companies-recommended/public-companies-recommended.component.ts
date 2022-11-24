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
  // public companies: Model.BasicInfo[] = [
  //   {
  //     companyName: "Slack",
  //     companyIndustry: "Technology",
  //     image: "slack",
  //     companyJobOpening: 17,
  //     companyLogo: "",
  //     companyId: ""
  //   },
  //   {
  //     companyName: "Microsoft",
  //     companyIndustry: "Technology",
  //     image: "microsoft",
  //     companyJobOpening: 0,
  //     companyLogo:"",
  //     companyId: ""
  //   },
  //   {
  //     companyName:"Google",
  //     companyIndustry: "Technology",
  //     image: "google",
  //     companyJobOpening: 54,
  //     companyLogo: "",
  //     companyId: ""
  //   },
  //   {
  //     companyName: "Airbnb",
  //     companyIndustry: "Rental",
  //     image:  "airbnb",
  //     companyJobOpening: 11,
  //     companyLogo: "",
  //     companyId: ""
  //   },
  //   {
  //     companyName: "Linkedin",
  //     companyIndustry: "Careers",
  //     image: "linkedin",
  //     companyJobOpening: 33,
  //     companyId: "",
  //     companyLogo: ""
  //   },
  //   {
  //     companyName: "Maya",
  //     companyIndustry: "Mobile Banking",
  //     image: "paymaya",
  //     companyJobOpening: 25,
  //     companyLogo: "",
  //     companyId: "",
  //   },
  // ];

  list$ = this.companiesFacade.companyList$;

  constructor(
    private companiesFacade: CompaniesFacade
  ) { }

  ngOnInit(): void {
    this.companiesFacade.getAllFeaturedCompanies();
  }

}
