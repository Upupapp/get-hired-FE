import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { SeoService } from '@app-core/services/seo.service';
import { CoreService } from '@app-core/services/core.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-error-not-found',
  templateUrl: './error-not-found.component.html',
  styleUrls: ['./error-not-found.component.scss']
})
export class ErrorNotFoundComponent implements OnInit, OnDestroy {
  // Same auth-state wiring as PublicComponent (the shell every other
  // public page renders under) so app-header shows the correct signed-
  // in/out state here too, rather than always rendering as if logged out.
  isUserLoggedIn: boolean;
  user: any = null;
  private authStateSubscription: Subscription;
  private userSubscription: Subscription;

  constructor(
    private location: Location,
    private router: Router,
    private seoService: SeoService,
    private coreService: CoreService,
  ) { }

  ngOnInit(): void {
    // SEO Phase 5 + 18: 404 must be noindex; has useful links home and to jobs.
    this.seoService.setPageMeta({
      title: 'Page Not Found | GetHired Online',
      description: 'The page you are looking for could not be found. Browse available jobs or return to the GetHired Online homepage.',
      robots: 'noindex, follow',
    });

    this.userSubscription = this.coreService.currentUser$.subscribe((user) => {
      this.user = user;
    });
    this.authStateSubscription = this.coreService.authState$.subscribe((loggedIn) => {
      this.isUserLoggedIn = loggedIn;
      this.coreService.refreshCurrentUserFromStorage();
    });
  }

  ngOnDestroy(): void {
    if (this.authStateSubscription) { this.authStateSubscription.unsubscribe(); }
    if (this.userSubscription) { this.userSubscription.unsubscribe(); }
  }

  goBack(): void {
    this.location.back();
  }

  goHome(): void {
    this.router.navigateByUrl('/home');
  }

  goToJobs(): void {
    this.router.navigateByUrl('/jobs');
  }

}
