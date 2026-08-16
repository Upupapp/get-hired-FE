import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import { AppFacade } from '@main/state/app.facade';
import { CoreService } from '../services/core.service';
import { Subscription } from 'rxjs';
import { environment } from '@environments/environment';

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
  readonly gatewayUrl = environment.gatewayUrl;

  /** Custom mobile nav toggle -- replaces Bootstrap's data-bs-toggle="collapse"
   * mechanism entirely. That mechanism relied on .navbar-collapse staying a
   * normal in-flow flex child of .gh-public-nav-inner (a `display:flex` row
   * with no `flex-wrap`), so the expanded panel never got its own row -- it
   * was squeezed into the remaining flex space of a 68px-tall fixed navbar
   * and rendered clipped/off-screen (confirmed via live repro: boundingBox
   * x:244 y:-29 on a 375px viewport, mostly outside the visible area).
   * Rebuilt as a plain boolean-driven panel positioned in its own CSS layer
   * below the fixed nav, independent of the toggler's flex row. */
  mobileNavOpen = false;

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
      this.closeMobileNav();

      // scroll to top every page change
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.initials = this.user.firstName.charAt(0).toUpperCase() + ' ' + this.user.lastName.charAt(0).toUpperCase();
    }
  }

  toggleMobileNav(): void {
    this.mobileNavOpen = !this.mobileNavOpen;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = this.mobileNavOpen ? 'hidden' : '';
    }
  }

  closeMobileNav(): void {
    if (!this.mobileNavOpen) { return; }
    this.mobileNavOpen = false;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  navigateToJobs(){
    this.router.navigate(['/jobs'], { relativeTo: this.route })
  }

  /** Employer-only app nav CTA -- goes to the employer signup flow. */
  goToSignup(): void {
    this.router.navigateByUrl('/signup');
  }

  redirectToRegister() {
    this.router.navigateByUrl('/signin');
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeMobileNav();
  }

  goToDashboard() {
    switch (this.userRole) {
      case '1':
        this.router.navigateByUrl('/admin/dashboard');
        break;
      case '2':
        this.router.navigateByUrl('/recruiter/dashboard');
        break;
      // applicant-panel/ lives only in gethired-jobseeker-FE now.
      case '3':
        this.router.navigateByUrl('/');
        break;
    }
  }

  logout() {
    localStorage.clear();
    this.appFacade.resetCredentials();
    this.router.navigateByUrl('/signin');
  }
}
