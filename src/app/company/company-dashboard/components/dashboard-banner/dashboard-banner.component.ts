import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { mainAnimations } from '@main/shared/animations/main-animations';

@Component({
  selector: 'app-dashboard-banner',
  templateUrl: './dashboard-banner.component.html',
  styleUrls: ['./dashboard-banner.component.scss'],
  animations: [mainAnimations]
})
export class DashboardBannerComponent implements OnInit {
  @Input() details: any;
  @Input() charts: any;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  redirectToEdit() {
    this.router.navigateByUrl('/recruiter/company/settings');
  }

}
