import { Component, HostListener, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Subscription } from 'rxjs';

/**
 * DESIGN OVERHAUL PORT (2026-08-19) -- ported from gethired-jobseeker-FE's
 * Job Seeker sidebar rebuild (Deep Navy background, coral active-state,
 * sub-nav groups, bottom user card) into this now-active get-hired-FE
 * codebase. Adapted for this repo's actually-available routes: there is no
 * Saved Jobs feature/route here, so the Jobs item has no sub_routes (it's a
 * direct link, unlike the source version's Browse/Saved sub-nav group).
 */
@Component({
  selector: 'app-applicant-sidebar',
  templateUrl: './applicant-sidebar.component.html',
  styleUrls: ['./applicant-sidebar.component.scss'],
  animations: [mainAnimations]
})
export class ApplicantSidebarComponent implements OnInit, OnDestroy {
  @Input() sidebarWidth;
  @Input() user;

  private req: Subscription;
  private collapsedRoutes = new Set<string>();

  public location: string = '';
  public screenHeight: number = 300;
  initials: string;

  sidebarItems = [
    {
      title: 'Dashboard', route: '/user/dashboard', icon: 'dashboard',
    },
    {
      title: 'Jobs', route: '/jobs', icon: 'jobs',
    },
    {
      title: 'Applications', route: '/user/applications', icon: 'applications',
    },
    {
      title: 'Career', route: '/user/profile', icon: 'career',
      sub_routes: [
        { title: 'Profile', route: '/user/profile/details' },
        { title: 'CV Builder & Match Coach', route: '/user/profile/cv-builder' },
      ],
    },
  ];

  constructor(private router: Router) {
    this.req = this.router.events.subscribe((event: any) => {
      if (!event || !event.url) { return; }
      this.location = this.router.url;
      this.collapsedRoutes.forEach(route => {
        if (this.router.url.startsWith(route)) {
          this.collapsedRoutes.delete(route);
        }
      });
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.screenHeight = window.innerHeight;
  }

  ngOnInit(): void {
    this.location = this.router.url;
    this.screenHeight = window.innerHeight;
    if (this.user) {
      this.initials = (this.user.firstName ? this.user.firstName.charAt(0) : '').toUpperCase()
        + (this.user.lastName ? this.user.lastName.charAt(0) : '').toUpperCase();
    }
  }

  isItemActive(item: any): boolean {
    if (item.sub_routes) {
      return item.sub_routes.some((sub: any) => this.subRouteActive(sub.route));
    }
    return this.location === item.route || this.location.startsWith(item.route + '/');
  }

  subRouteActive(route: string): boolean {
    return this.location === route || this.location.startsWith(route + '/');
  }

  isSubnavOpen(item: any): boolean {
    if (!item.sub_routes) { return false; }
    return this.isItemActive(item) && !this.collapsedRoutes.has(item.route);
  }

  toggleCollapse(event: MouseEvent, route: string): void {
    event.stopPropagation();
    if (this.collapsedRoutes.has(route)) {
      this.collapsedRoutes.delete(route);
    } else {
      this.collapsedRoutes.add(route);
    }
  }

  changeRoute(route: string): void {
    this.router.navigate([route]);
  }

  ngOnDestroy(): void {
    if (this.req) { this.req.unsubscribe(); }
  }
}
