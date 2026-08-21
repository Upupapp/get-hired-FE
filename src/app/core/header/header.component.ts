import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostListener,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import { AppFacade } from '@main/state/app.facade';
import { CoreService } from '../services/core.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() user: any;
  @Input() isUserLoggedIn: boolean;
  @Input() isPublic: boolean;
  userRole = localStorage.getItem('role');
  initials: string;

  // Mobile nav drawer — same pattern as the Employer/Applicant/Admin portal
  // drawers (gh-mobile-drawer + gh-mobile-scrim), so the public site nav
  // (Home/Jobs/Employers/etc.) gets the same modern mobile treatment
  // instead of Bootstrap's plain collapse-dropdown.
  mobileNavOpen = false;
  @ViewChild('mobileMenuBtn') mobileMenuBtnRef: ElementRef<HTMLButtonElement>;
  @ViewChild('firstDrawerLink') firstDrawerLinkRef: ElementRef<HTMLElement>;

  public req: Subscription;
  public location: any;

  constructor(
    private coreService: CoreService,
    private router: Router,
    private route: ActivatedRoute,
    private appFacade: AppFacade
  ) {
    this.req = this.router.events.subscribe((event: any) => {
      this.location = this.router.url;

      // scroll to top every page change
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });

      // Close the mobile drawer on navigation -- otherwise it stays open
      // (with its scrim blocking the page) across a route change triggered
      // from outside the drawer, e.g. browser back/forward.
      this.closeMobileNav();
    });
  }

  openMobileNav(): void {
    this.mobileNavOpen = true;
    setTimeout(() => {
      if (this.firstDrawerLinkRef?.nativeElement) {
        this.firstDrawerLinkRef.nativeElement.focus();
      }
    }, 200);
  }

  closeMobileNav(): void {
    if (!this.mobileNavOpen) return;
    this.mobileNavOpen = false;
    setTimeout(() => {
      if (this.mobileMenuBtnRef?.nativeElement) {
        this.mobileMenuBtnRef.nativeElement.focus();
      }
    }, 50);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.mobileNavOpen) {
      this.closeMobileNav();
    }
  }

  ngOnInit(): void {
    if (this.user) {
      this.initials = this.user.firstName.charAt(0).toUpperCase() + ' ' + this.user.lastName.charAt(0).toUpperCase();
    }
  }

  navigateToJobs(){
    this.router.navigate(['/jobs'], { relativeTo: this.route })
  }

  redirectToRegister() {
    this.router.navigateByUrl('/signin');
  }

  goToDashboard() {
    switch (this.userRole) {
      case '1':
        this.router.navigateByUrl('/admin/dashboard');
        break;
      case '2':
        this.router.navigateByUrl('/recruiter/dashboard');
        break;
      case '3':
        this.router.navigateByUrl('/user/dashboard');
        break;
    }
  }

  logout() {
    // Was localStorage.clear() -- the same unsafe blanket-clear bug fixed
    // in CoreService.logout() earlier (bc2d35e0), reintroduced here via a
    // separate, unguarded logout path. A blanket clear() deletes ANY other
    // owner's AI Create recovery/guest data sharing this storage, not just
    // this session's own keys. Routed through the canonical logout() (real
    // backend revoke + targeted key removal + NgRx credentials reset) so
    // every logout path in the app behaves identically.
    this.coreService.logout();
    this.appFacade.resetCredentials();
    this.router.navigateByUrl('/signin');
  }
}
