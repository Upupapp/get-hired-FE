import { Component, HostListener, Inject, OnInit, OnDestroy, Input, Output, EventEmitter, Optional, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { ActivatedRoute, Router } from '@angular/router';
import { JobFacade } from '@app-job/state/job.facade';
import { Location } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from "@environments/environment";
import { catchError, map, of, Subscription, tap } from 'rxjs';
import { JobsService } from '../jobs.service';
import { CoreService } from '@app-core/services/core.service';
import { SeoService } from '@app-core/services/seo.service';
import { PublicJobNormalizerService } from '@main/public/services/public-job-normalizer.service';
import { JobSignalsService } from '@main/public/services/job-signals.service';

@Component({
  selector: 'app-job-posts-details',
  templateUrl: './job-posts-details.component.html',
  styleUrls: ['./job-posts-details.component.scss'],
  animations: [mainAnimations]
})
export class JobPostsDetailsComponent implements OnInit, OnDestroy {
  @Input() withBanner: boolean = true;
  @Output() apply = new EventEmitter();

  savedStatus: 'saved' | 'not_saved' | 'unknown' = 'unknown';
  saveLoading = false;
  showMobileBar = false;
  descriptionExpanded = false;

  details$ = this.jobFacade.getJobById$;
  // Normalized, defensively-typed view of the same data for the new
  // match panel / signal badges -- read-only, does not change the
  // facade's own fetch contract. GH-ACT-020 (job detail redesign).
  normalizedJob$ = this.details$.pipe(
    map(job => job ? this.normalizer.normalize(job) : null)
  );
  jobSignals$ = this.normalizedJob$.pipe(
    map(job => job ? this.jobSignals.compute(job) : null)
  );
  // GH-ACT-013 (job detail error/loading states): previously a failed fetch
  // (expired/deleted/invalid job id) rendered nothing at all -- a silent
  // blank page with no explanation and no way to recover.
  loading$ = this.jobFacade.getJobLoading$;
  jobError$ = this.jobFacade.jobError$;
  link$: Subscription;
  jobId: string;
  userRole: string;
  currentUrl$: Subscription;

  public screenSize: number = 1600;

  constructor(
    private jobFacade: JobFacade,
    private route: ActivatedRoute,
    private router: Router,
    public location: Location,
    private clipboard: Clipboard,
    private snackbarService: SnackbarService,
    private jobsService: JobsService,
    private coreService: CoreService,
    private normalizer: PublicJobNormalizerService,
    private jobSignals: JobSignalsService,
    private titleService: Title,
    private meta: Meta,
    private seoService: SeoService,
    @Inject(PLATFORM_ID) private platformId: object,
    // RESPONSE is only available during SSR (Express context).
    // @Optional() ensures the component does not crash in the browser
    // where no RESPONSE provider exists.
    @Optional() @Inject(RESPONSE) private response: any
  ) {
    this.jobId = this.route.snapshot.params['id']
  }

  private normalizedJobSub: Subscription;
  private jobErrorSub: Subscription;

  ngOnInit(): void {
    this.jobFacade.getJobById(this.jobId);
    this.coreService.getRole()
      .then(role => this.userRole = role);

    this.normalizedJobSub = this.normalizedJob$.subscribe(job => {
      if (job) {
        this.titleService.setTitle(`${job.title} at ${job.companyName} | GetHired`);
        this.meta.updateTag({ name: 'robots', content: 'index, follow' });
        this.seoService.setCanonical(`https://gethiredonline.app/jobs/details/${job.jobId}`);
        this.savedStatus = job.savedStatus;
      }
    });

    // SEO-V4: error pages (expired/deleted/not-found jobs) get:
    //   1. noindex so Google stops crawling dead-content pages.
    //   2. A descriptive title for the browser tab (and SSR head).
    //   3. HTTP 404 in the SSR context via the RESPONSE token so Googlebot
    //      receives a real 404 rather than a soft-404 (HTTP 200 + error text).
    //      @Optional() on RESPONSE means this safely no-ops in the browser.
    this.jobErrorSub = this.jobError$.subscribe(err => {
      if (err) {
        this.meta.updateTag({ name: 'robots', content: 'noindex' });
        this.titleService.setTitle('Job not found | GetHired');
        // SSR-only: signal real 404 to crawlers (Googlebot, Bing).
        // isPlatformServer guard ensures this is skipped in the browser.
        if (isPlatformServer(this.platformId) && this.response) {
          this.response.status(404);
        }
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.screenSize = window.innerWidth;
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.showMobileBar = window.scrollY > 300;
    }
  }

  goBack() {
    this.location.back();
  }

  goToJobsList(): void {
    this.router.navigateByUrl('/jobs');
  }

  toApply() {
    this.apply.emit(true);
  }

  toLogin() {
    this.currentUrl$ = this.route.url.subscribe(value => {
      if (value.length > 0) {
        let url = '';
        value.forEach(path => {
          url = url + '/' + path
        });

        localStorage.setItem('returnURL', url);
        this.router.navigateByUrl('signin');
      }
    })

  }

  toggleSave(jobId: string): void {
    if (this.userRole !== '3') {
      this.toLogin();
      return;
    }
    if (this.saveLoading) { return; }
    this.saveLoading = true;
    const prev = this.savedStatus;
    this.savedStatus = this.savedStatus === 'saved' ? 'not_saved' : 'saved';
    this.jobsService.toggleSaveJob(jobId).subscribe({
      next: (res: any) => {
        this.savedStatus = (res && res.data && res.data.isSaved) ? 'saved' : 'not_saved';
        this.saveLoading = false;
      },
      error: () => {
        this.savedStatus = prev;
        this.saveLoading = false;
        this.snackbarService.success('Could not save job. Please try again.', '');
      }
    });
  }

  toggleDescription(): void {
    this.descriptionExpanded = !this.descriptionExpanded;
  }

  reportJob(jobId: string): void {
    this.snackbarService.success('Thank you for reporting. We will review this job posting.', '');
  }

  getShareableLink(jobId: string) {
    this.link$ = this.jobsService.getShareableLink(jobId)
      .pipe(
        tap(res => {
          if (res.data) {
            this.clipboard.copy(res.data.shortLink)
            this.snackbarService.success(`Link copied to your clipboard`, '');
          }
        }),
        catchError(err => of(err))
      ).subscribe();

  }

  ngOnDestroy(): void {
    if (this.link$) {
      this.link$.unsubscribe();
    }

    if (this.currentUrl$) {
      this.currentUrl$.unsubscribe();
    }

    if (this.normalizedJobSub) {
      this.normalizedJobSub.unsubscribe();
    }

    if (this.jobErrorSub) {
      this.jobErrorSub.unsubscribe();
    }

    this.seoService.clearCanonical();
    // Reset to the site default rather than leaving a stale job title
    // visible on whatever page the user navigates to next -- no app-wide
    // title management exists today to restore a "previous" title instead.
    this.titleService.setTitle('Get Hired - Hire experts or be hired for any job, any time.');
  }

}
