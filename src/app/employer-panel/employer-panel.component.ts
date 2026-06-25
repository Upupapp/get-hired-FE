import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CompanyNotSetupComponent } from '@main/company/company-not-setup/company-not-setup.component';
import { CoreService } from '@main/core/services/core.service';
import { EmployeeFacade } from '@main/employee/state/employee.facade';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

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

  @ViewChild('mobileMenuBtn') mobileMenuBtnRef: ElementRef<HTMLButtonElement>;
  @ViewChild('firstDrawerLink') firstDrawerLinkRef: ElementRef<HTMLAnchorElement>;

  private routerSub: Subscription;

  constructor(
    private coreService: CoreService,
    private employeeFacade: EmployeeFacade,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.coreService.isLoggedIn();
    this.employeeFacade.getEmployeeProfile(this.user._id);

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
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
  }
}
