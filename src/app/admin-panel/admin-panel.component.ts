import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, ElementRef, HostListener, QueryList } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CoreService } from '@app-core/services/core.service';
import { AdminFacade } from './state/admin.facade';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ADMIN_NAV } from './admin-nav';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  isUserLoggedIn: boolean;
  local = JSON.parse(localStorage.getItem('user'));
  user$ = this.adminFacade.user$;

  // MOBILEVIEW: Mobile drawer state
  mobileNavOpen = false;

  @ViewChildren('drawerLink') drawerLinks: QueryList<ElementRef<HTMLAnchorElement>>;
  // BL-003: focus return target — the hamburger button
  @ViewChild('mobileMenuBtn') mobileMenuBtn: ElementRef;

  readonly navItems = ADMIN_NAV;

  private routerSub: Subscription;

  constructor(
    private coreService: CoreService,
    private adminFacade: AdminFacade,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.coreService.isLoggedIn();
    this.adminFacade.getUser(this.local._id);

    // MOBILEVIEW: Close mobile drawer on every successful navigation
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.closeMobileNav());
  }

  ngOnDestroy(): void {
    if (this.routerSub) { this.routerSub.unsubscribe(); }
  }

  // MOBILEVIEW: Open admin mobile nav drawer
  openMobileNav(): void {
    this.mobileNavOpen = true;
    setTimeout(() => {
      const first = this.drawerLinks && this.drawerLinks.first;
      if (first && first.nativeElement) {
        first.nativeElement.focus();
      }
    }, 200);
  }

  // MOBILEVIEW: Close admin mobile nav drawer
  // BL-003: after closing, return focus to hamburger button (WCAG 2.4.3).
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
