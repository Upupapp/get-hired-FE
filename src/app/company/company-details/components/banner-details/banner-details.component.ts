import { Component, Input, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from '@main/company/company.model';

@Component({
  selector: 'app-banner-details',
  templateUrl: './banner-details.component.html',
  styleUrls: ['./banner-details.component.scss'],
  animations: [mainAnimations]
})
export class BannerDetailsComponent implements OnInit {
  @Input() details: Model.Company;
  userRoles = localStorage.getItem('role');

  constructor() { }

  ngOnInit(): void {
  }

}
