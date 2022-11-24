import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from '../companies.model';

@Component({
  selector: 'app-company-card',
  templateUrl: './company-card.component.html',
  styleUrls: ['./company-card.component.scss'],
  animations: [mainAnimations]
})
export class CompanyCardComponent implements OnInit {
  @Input() company: Model.BasicInfo | Model.Company;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  gotToDetails() {
    this.router.navigateByUrl(`companies/details?id=${this.company.companyId}`);
  }
}
