import { Component, HostListener, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JobFacade } from '@app-job/state/job.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { SeoService } from '@app-core/services/seo.service';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { RESPONSE } from '@nguniversal/express-engine/tokens';

@Component({
  selector: 'app-public-details',
  templateUrl: './public-details.component.html',
  styleUrls: ['./public-details.component.scss'],
  animations: [mainAnimations]
})
export class PublicDetailsComponent implements OnInit, OnDestroy {
  @Input() isApplying: boolean = false;

  details$ = this.jobFacade.getJobById$;
  jobId: string;
  public screenSize: number = 1600;

  private seoSub: Subscription;
  private errorSub: Subscription;

  constructor(
    private jobFacade: JobFacade,
    private route: ActivatedRoute,
    private seoService: SeoService,
    @Optional() @Inject(RESPONSE) private response: any,
  ) {
    this.jobId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.jobFacade.getJobById(this.jobId);

    // Error state: set noindex and (on the server) HTTP 404 when the job
    // fetch fails so error pages are never indexed as thin content.
    // RESPONSE is null on the browser (@Optional), so the status call is guarded.
    this.errorSub = this.jobFacade.jobError$.pipe(
      filter(err => !!err),
      take(1),
    ).subscribe(() => {
      if (this.response) {
        this.response.status(404);
      }
      this.seoService.setPageMeta({
        title: 'Job Not Found | GetHired Online',
        description: 'This job posting is no longer available on GetHired Online.',
        robots: 'noindex, nofollow',
      });
    });

    // SEO Phase 4 + 6: set metadata and JobPosting JSON-LD once job data arrives.
    // Only active (jobStatusId === 2) jobs get JobPosting schema.
    this.seoSub = this.details$.pipe(
      filter(job => !!job && !!job.jobTitle),
      take(1),
    ).subscribe(job => {
      const companyName = (job as any).company_name || (job as any).companyName || 'GetHired Company';
      const title = `${job.jobTitle} at ${companyName} | GetHired Online`;
      const description = `Apply for ${job.jobTitle} at ${companyName}. ` +
        `View job details, location, requirements, and apply on GetHired Online.`;

      // V3: use job's own hero banner as the OG/social image when available;
      // falls back to seoService DEFAULT_OG_IMAGE automatically when undefined.
      const bannerUrl: string | undefined = (job as any).jobBanner || undefined;

      this.seoService.setPageMeta({
        title,
        description,
        canonical: `https://gethiredonline.app/jobs/details/${this.jobId}`,
        robots: job.jobStatusId === 2 ? 'index, follow' : 'noindex, nofollow',
        ogType: 'article',
        ogImage: bannerUrl,
        ogImageAlt: `${job.jobTitle} at ${companyName}`,
      });

      this.seoService.setBreadcrumbJsonLd([
        { name: 'Home', url: 'https://gethiredonline.app/home' },
        { name: 'Jobs', url: 'https://gethiredonline.app/jobs' },
        { name: job.jobTitle, url: `https://gethiredonline.app/jobs/details/${this.jobId}` },
      ]);

      // JobPosting structured data: ONLY for published/active jobs
      if (job.jobStatusId === 2) {
        this.seoService.setJobPostingJsonLd(job);
      } else {
        this.seoService.clearJobPostingJsonLd();
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }

  apply(event): void {
    this.isApplying = event;
  }

  ngOnDestroy(): void {
    // Clear job-specific structured data when leaving this page
    this.seoService.clearJobPostingJsonLd();
    this.seoService.clearBreadcrumbJsonLd();
    if (this.seoSub) {
      this.seoSub.unsubscribe();
    }
    if (this.errorSub) {
      this.errorSub.unsubscribe();
    }
  }
}
