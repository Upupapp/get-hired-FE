import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
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

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
  }

  redirectToEdit() {
    this.router.navigate(['../settings'], { relativeTo: this.route });
  }

}
