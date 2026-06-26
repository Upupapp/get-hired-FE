import { Component, HostListener, Inject, OnInit, OnDestroy, Input, Output, EventEmitter, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { JobFacade } from '@app-job/state/job.facade';
import { Location } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from "@environments/environment";
import { catchError, map, of, Subscription, tap } from 'rxjs';
import { JobsService } from '../jobs.service';
import { CoreService } from '@app-core/services/core.service';
import { PublicJobNormalizerService } from '@main/public/services/public-job-normalizer.service';
import { JobSignalsService } from '@main/public/services/job-signals.service';
import { JobStructuredDataService } from '@main/public/services/job-structured-data.service';

@Component({
  selector: 'app-job-posts-details',
  templateUrl: './job-posts-details.component.html',
  styleUrls: ['./job-posts-details.component.scss'],
  animations: [mainAnimations]
})
export class JobPostsDetailsComponent implements OnInit, OnDestroy {
  @Input() withBanner: boolean = true;
  @Output() apply = new EventEmitter();
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
    private snackBar: MatSnackBar,
    private jobsService: JobsService,
    private coreService: CoreService,
    private normalizer: PublicJobNormalizerService,
    private jobSignals: JobSignalsService,
    private titleService: Title,
    private meta: Meta,
    private structuredData: JobStructuredDataService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.jobId = this.route.snapshot.params['id']
  }

  private normalizedJobSub: Subscription;
  private jobErrorSub: Subscription;

  ngOnInit(): void {
    this.jobFacade.getJobById(this.jobId);
    this.coreService.getRole()
      .then(role => this.userRole = role);

    // GH-ACT step 17 (SEO): set a real per-job page title and inject
    // schema.org JobPosting structured data once the job loads. No
    // page-title/structured-data management existed anywhere in this
    // codebase before this (confirmed via repo-wide search).
    this.normalizedJobSub = this.normalizedJob$.subscribe(job => {
      if (job) {
        this.titleService.setTitle(`${job.title} at ${job.companyName} | GetHired`);
        this.meta.updateTag({ name: 'robots', content: 'index, follow' });
        this.structuredData.apply(job);
      }
    });

    // SEO: error pages (expired/deleted/not-found jobs) return HTTP 200 from SSR.
    // Mark them noindex so Google doesn't index thin/dead-content pages.
    this.jobErrorSub = this.jobError$.subscribe(err => {
      if (err) {
        this.meta.updateTag({ name: 'robots', content: 'noindex' });
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.screenSize = window.innerWidth;
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

  getShareableLink(jobId: string) {
    this.link$ = this.jobsService.getShareableLink(jobId)
      .pipe(
        tap(res => {
          if (res.data) {
            console.log(res.data);
            this.clipboard.copy(res.data.shortLink)
            this.snackBar.open(`Link copied to your clipboard`, '', {
              duration: 4000,
              panelClass: 'success-snackbar',
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
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

    this.structuredData.remove();
    // Reset to the site default rather than leaving a stale job title
    // visible on whatever page the user navigates to next -- no app-wide
    // title management exists today to restore a "previous" title instead.
    this.titleService.setTitle('Get Hired - Hire experts or be hired for any job, any time.');
  }

}
