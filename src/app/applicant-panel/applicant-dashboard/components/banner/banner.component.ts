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

  // IMAGE-CONSISTENCY FIX: this <img> had no *ngIf guard and no error
  // handling at all -- an applicant with no avatar yet (the default state
  // for a new account) rendered an <img> with an empty/undefined src
  // (broken-image icon), and a 404'd photoUrl showed the same broken icon
  // forever. avatarFailed flips to true on (error) and falls through to
  // the initials fallback -- never re-attempts the same failed URL.
  avatarFailed = false;

  onAvatarError(): void { this.avatarFailed = true; }

  get hasAvatar(): boolean {
    return !this.avatarFailed && !!(this.details?.photoUrl && String(this.details.photoUrl).trim());
  }

  get avatarInitials(): string {
    const f = (this.details?.firstName || '').charAt(0).toUpperCase();
    const l = (this.details?.lastName || '').charAt(0).toUpperCase();
    return (f + l) || f || '?';
  }

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
