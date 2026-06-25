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

  // MOBILEVIEW: Mobile drawer state
  mobileNavOpen = false;

  @ViewChild('firstApDrawerLink') firstApDrawerLinkRef: ElementRef<HTMLAnchorElement>;

  private routerSub: Subscription;

  constructor(
    private coreService: CoreService,
    private applicantFacade: ApplicantFacade,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.coreService.isLoggedIn();
    this.applicantFacade.getUser(this.local._id);

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
  closeMobileNav(): void {
    this.mobileNavOpen = false;
  }

  // MOBILEVIEW: Close drawer on Escape key
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.mobileNavOpen) {
      this.closeMobileNav();
    }
  }
}
