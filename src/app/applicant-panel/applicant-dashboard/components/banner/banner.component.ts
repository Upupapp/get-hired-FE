import { Component, Inject, OnInit, OnDestroy, Input, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { AdminService } from '@app-shared/services/auth/admin/admin.service';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-applicant-panel-banner',
  animations: [mainAnimations],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})
export class BannerComponent implements OnInit {
  // OPTIMIZE-R3: field initializer calling localStorage crashes SSR.
  // Moved to ngOnInit behind isPlatformBrowser guard. Default null is
  // safe — the template already guards on loggedUserData being truthy.
  public loggedUserData: any = null;
  @Input() details;
  @Input() cardDetails;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loggedUserData = JSON.parse(localStorage.getItem('userData') || 'null');
    }
  }
}
