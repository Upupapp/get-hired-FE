import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CompanyNotSetupComponent } from '@main/company/company-not-setup/company-not-setup.component';
import { CompanyFacade } from '@main/company/state/company.facade';
import { CoreService } from '@main/core/services/core.service';
import { EmployeeFacade } from '@main/employee/state/employee.facade';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-employer-panel',
  templateUrl: './employer-panel.component.html',
  styleUrls: ['./employer-panel.component.scss'],
  animations: [mainAnimations]
})
export class EmployerPanelComponent implements OnInit, OnDestroy {
  isUserLoggedIn: boolean;
  user = JSON.parse(localStorage.getItem('user'));
  employee$ = this.employeeFacade.employeeDetails$;
  loading$ = this.employeeFacade.loading$;

  // B02: Mobile drawer state
  mobileNavOpen = false;

  avatarMenuOpen = false;
  companyNameForTopbar$: Observable<string>;
  companyLogoUrl$: Observable<string>;

  @ViewChild('mobileMenuBtn') mobileMenuBtnRef: ElementRef<HTMLButtonElement>;
  @ViewChild('firstDrawerLink') firstDrawerLinkRef: ElementRef<HTMLAnchorElement>;

  private routerSub: Subscription;

  constructor(
    private coreService: CoreService,
    private employeeFacade: EmployeeFacade,
    private companyFacade: CompanyFacade,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.coreService.isLoggedIn();
    this.employeeFacade.getEmployeeProfile(this.user._id);

    // companyName for topbar avatar menu — reads from companyFacade.companyDetails$
    // (the authoritative store slice) so it updates immediately when the recruiter
    // saves company settings, without waiting for a getEmployeeProfile() re-fetch.
    this.companyNameForTopbar$ = this.companyFacade.companyDetails$.pipe(
      map(company => (company && company.companyName) ? company.companyName : '')
    );
    this.companyLogoUrl$ = this.companyFacade.companyDetails$.pipe(
      map(company => (company && company.companyLogoUrl) ? company.companyLogoUrl : '')
    );

    // B02: Close mobile drawer on every successful navigation
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.closeMobileNav());
  }

  // B02: Open mobile nav drawer
  openMobileNav(): void {
    this.mobileNavOpen = true;
    // Move focus into drawer after CSS transition completes
    setTimeout(() => {
      if (this.firstDrawerLinkRef?.nativeElement) {
        this.firstDrawerLinkRef.nativeElement.focus();
      }
    }, 200);
  }

  // B02: Close mobile nav drawer and return focus to menu button
  closeMobileNav(): void {
    if (!this.mobileNavOpen) return;
    this.mobileNavOpen = false;
    // Return focus to hamburger button after drawer closes
    setTimeout(() => {
      if (this.mobileMenuBtnRef?.nativeElement) {
        this.mobileMenuBtnRef.nativeElement.focus();
      }
    }, 50);
  }

  // B02: Global Escape handler — closes drawer from anywhere on the page
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.mobileNavOpen) {
      this.closeMobileNav();
    }
    if (this.avatarMenuOpen) {
      this.closeAvatarMenu();
    }
  }

  // Close avatar menu on outside click
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.avatarMenuOpen && target && !target.closest('.gh-topbar-avatar-wrap')) {
      this.closeAvatarMenu();
    }
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  get pageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/jobs')) return 'Jobs';
    if (url.includes('/contacts') || url.includes('/candidates')) return 'Candidates';
    if (url.includes('/interview')) return 'Interviews';
    if (url.includes('/messages')) return 'Messages';
    if (url.includes('/company')) return 'Company';
    if (url.includes('/subscription')) return 'Subscription';
    return 'Dashboard';
  }

  toggleAvatarMenu(): void {
    this.avatarMenuOpen = !this.avatarMenuOpen;
  }

  closeAvatarMenu(): void {
    this.avatarMenuOpen = false;
  }

  goToCreateJob(): void {
    this.router.navigate(['/recruiter/jobs/create']);
  }

  goToJobsList(): void {
    this.router.navigate(['/recruiter/contacts/candidates']);
  }

  logout(): void {
    this.coreService.logout();
  }
}
