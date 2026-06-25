import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CoreService } from '@app-core/services/core.service';
import { ApplicantFacade } from '@main/applicant/state/applicant.facade';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-applicant-panel',
  templateUrl: './applicant-panel.component.html',
  styleUrls: ['./applicant-panel.component.scss']
})
export class ApplicantPanelComponent implements OnInit, OnDestroy {
  fullName = 'GetHired Applicant';
  isUserLoggedIn: boolean;
  local = JSON.parse(localStorage.getItem('user'));
  user$ = this.applicantFacade.user$;
  // SEC-01 NOTIFY: wire error$ so the template can render a safe fallback
  // when getUserProfile() fails (401 / 403 / 404 / generic).
  error$ = this.applicantFacade.error$;

  // MOBILEVIEW: Mobile drawer state
  mobileNavOpen = false;

  @ViewChild('firstApDrawerLink') firstApDrawerLinkRef: ElementRef<HTMLAnchorElement>;
  // BL-002: focus return target — the hamburger button
  @ViewChild('mobileMenuBtn') mobileMenuBtn: ElementRef;

  private routerSub: Subscription;

  constructor(
    private coreService: CoreService,
    private applicantFacade: ApplicantFacade,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.coreService.isLoggedIn();
    // SEC-01 FIX: no longer passes local._id. The backend derives identity
    // from the verified Firebase JWT (Authorization header), not from a
    // client-supplied userId param. Sending a uid was the IDOR vector.
    this.applicantFacade.getUser();

    // MOBILEVIEW: Close mobile drawer on every successful navigation
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.closeMobileNav());
  }

  ngOnDestroy(): void {
    if (this.routerSub) { this.routerSub.unsubscribe(); }
  }

  // MOBILEVIEW: Open applicant mobile nav drawer
  openMobileNav(): void {
    this.mobileNavOpen = true;
    setTimeout(() => {
      if (this.firstApDrawerLinkRef?.nativeElement) {
        this.firstApDrawerLinkRef.nativeElement.focus();
      }
    }, 200);
  }

  // MOBILEVIEW: Close applicant mobile nav drawer
  // BL-002: after closing, return focus to hamburger button so screen-reader
  // users land in a predictable, logical position (WCAG 2.4.3).
  closeMobileNav(): void {
    this.mobileNavOpen = false;
    setTimeout(() => this.mobileMenuBtn?.nativeElement?.focus(), 50);
  }

  // MOBILEVIEW: Close drawer on Escape key
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.mobileNavOpen) {
      this.closeMobileNav();
    }
  }
}
