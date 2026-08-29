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

  // DESIGN OVERHAUL PORT (2026-08-19): ported from gethired-jobseeker-FE's
  // Job Seeker portal redesign (Increment 1 there) into this combined
  // get-hired-FE codebase's applicant-panel -- per this repo's own
  // ownership reversal, get-hired-FE is now the active target and the two
  // separated frontends are frozen. Desktop topbar (title/subtitle/actions/
  // avatar menu), matching employer-panel.component.ts's own
  // pageTitle/parentLabel/pageSubtitle URL-matching pattern.
  avatarMenuOpen = false;

  get pageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard'))                return 'Dashboard';
    if (url.includes('/applications'))              return 'My Applications';
    if (url.includes('/profile/cv-builder'))        return 'CV Builder & Match Coach';
    if (url.includes('/profile'))                   return 'Profile';
    if (url.includes('/settings'))                  return 'Settings';
    if (url.startsWith('/jobs'))                    return 'Browse Jobs';
    return 'Dashboard';
  }

  get parentLabel(): string {
    const url = this.router.url;
    if (url.startsWith('/jobs'))                    return 'Jobs';
    if (url.includes('/profile'))                   return 'Career';
    return '';
  }

  get pageSubtitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard'))                return 'Your career activity at a glance.';
    if (url.includes('/applications'))              return 'Track your applications and next steps.';
    if (url.includes('/profile/cv-builder'))        return 'Improve your CV and understand how it matches real jobs.';
    if (url.includes('/profile'))                   return 'Keep your candidate information current.';
    if (url.includes('/settings'))                  return 'Manage your account and preferences.';
    if (url.startsWith('/jobs'))                    return 'Find opportunities that fit your profile.';
    return '';
  }

  toggleAvatarMenu(): void {
    this.avatarMenuOpen = !this.avatarMenuOpen;
  }

  closeAvatarMenu(): void {
    this.avatarMenuOpen = false;
  }

  goToBrowseJobs(): void {
    this.router.navigate(['/jobs']);
  }

  // SIGNOUT RACE FIX: this used to fire coreService.logout() and
  // router.navigate(['/signin']) as two bare consecutive statements. /signin
  // is gated by UnauthGuard, which -- if it sees any stale "still logged in"
  // signal -- makes a real network call (verifySession() -> GET
  // /auth/getprofile) before deciding whether to render /signin or redirect
  // straight back into the dashboard. That guard resolution is async, and
  // while it's pending the previous (dashboard) view stays on screen: from
  // the user's side, "I clicked sign out and nothing happened," reliably
  // fixed only by a hard refresh (a truly clean bootstrap with no leftover
  // in-memory state to race). employer-panel.component.ts's logout()
  // (GETHIRED_EMPLOYER_PORTAL_SIGNOUT_FIX) already avoids this entirely by
  // sequencing through coreService.logout().subscribe(...) and redirecting
  // to '/' (Home, no UnauthGuard at all) instead of '/signin' -- same fix,
  // applied here.
  logoutInProgress = false;

  logout(): void {
    if (this.logoutInProgress) return; // duplicate-click guard
    this.logoutInProgress = true;
    this.closeAvatarMenu();
    this.coreService.logout().subscribe({
      next: () => {
        this.logoutInProgress = false;
        // HARD-RELOAD SIGNOUT FIX: was router.navigateByUrl('/') -- an
        // in-SPA transition that keeps every Angular singleton/NgRx store
        // slice/RxJS subscription alive in memory. After multiple targeted
        // fixes (a resetConfig-mutating legacy guard, missing Cache-Control
        // on the session-check endpoint, unenforced token revocation, a
        // stateful Firebase Client SDK singleton on the email/password
        // login path) still didn't fully resolve "sign out then /signin
        // bounces back to the dashboard, repeatedly, until rate-limited,"
        // a full browser-level reload is the more defensible fix: it
        // guarantees a truly clean slate (fresh bundle fetch, fresh
        // Angular bootstrap, nothing carried over in memory) at this
        // security-sensitive boundary, regardless of which in-memory state
        // was still going stale. window.location.href (not router
        // navigation) is what actually forces that reload.
        window.location.href = '/';
      },
      error: () => {
        // coreService.logout()'s local state-clear has no real failure mode
        // (synchronous localStorage writes; the backend revoke call is
        // already caught internally and never surfaces here) -- this branch
        // exists so a future failure mode is handled truthfully rather than
        // silently, matching employer-panel's own logout().
        this.logoutInProgress = false;
        // HARD-RELOAD SIGNOUT FIX: was router.navigateByUrl('/') -- an
        // in-SPA transition that keeps every Angular singleton/NgRx store
        // slice/RxJS subscription alive in memory. After multiple targeted
        // fixes (a resetConfig-mutating legacy guard, missing Cache-Control
        // on the session-check endpoint, unenforced token revocation, a
        // stateful Firebase Client SDK singleton on the email/password
        // login path) still didn't fully resolve "sign out then /signin
        // bounces back to the dashboard, repeatedly, until rate-limited,"
        // a full browser-level reload is the more defensible fix: it
        // guarantees a truly clean slate (fresh bundle fetch, fresh
        // Angular bootstrap, nothing carried over in memory) at this
        // security-sensitive boundary, regardless of which in-memory state
        // was still going stale. window.location.href (not router
        // navigation) is what actually forces that reload.
        window.location.href = '/';
      },
    });
  }

  signInAgain(): void {
    this.router.navigate(['/signin']);
  }
}
