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
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loggedUserData = JSON.parse(localStorage.getItem('userData') || 'null');
    }
  }

  // BUGFIX: these three stat cards looked clickable (hover-affordance
  // styling, an arrow icon) but had no click handler at all -- clicking
  // "Active Application", "Video Interview", or "Total Job Application" did
  // nothing. /user/applications (ApplicantApplicationsComponent) is the one
  // real list this app has today -- it shows every application with its
  // status chip (Applied/Under Review/Shortlisted/Hired/Rejected/etc, see
  // statusChipClass()), so it's the correct destination for all three
  // counts until/unless a per-status filtered view is built. Routing here
  // rather than fabricating a filter query param the target page doesn't
  // actually implement yet.
  goToApplications(): void {
    this.router.navigateByUrl('/user/applications');
  }
}
