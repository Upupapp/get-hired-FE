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
import { HapticFeedbackService } from '@app-shared/services/haptic-feedback/haptic-feedback.service';

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

  // READING COMPANION (Opportunity Brief Phase F -- merged Decision Console):
  // presentational-only state for the floating "job snapshot" companion.
  // Phase F folds the former sticky `.gh-detail-rail`/Decision Console
  // (Apply/Save/status/job-snapshot facts) into this panel -- it is now the
  // single real home of that content on tablet/desktop widths, not a mirror
  // of a separate rail. Starts OPEN by default (not a click-to-reveal
  // shortcut anymore) so Apply stays visible/prominent without an extra tap,
  // matching the always-visible rail it replaces; still user-collapsible via
  // the FAB toggle. None of this state gates or duplicates Apply/Save
  // business logic -- it only calls the existing
  // toApply()/toLogin()/toggleSave()/getShareableLink() handlers moved in
  // unchanged from the old rail markup.
  snapshotCompanionOpen = true;
  activeSnapshotSectionId = '';
  readonly snapshotSections: { id: string; label: string }[] = [
    { id: 'role-about', label: 'Overview' },
    { id: 'role-duties', label: 'Responsibilities' },
    { id: 'role-requirements', label: 'Requirements' },
    { id: 'role-apply-info', label: 'How to apply' },
  ];
  // Fixed global nav (.gh-public-nav, core/header) is 68px tall and sits on
  // top of the page -- both the scroll-spy reference line and the actual
  // scroll-to offset below must clear it, or a section lands partially
  // hidden underneath it instead of at "the correct spot".
  private readonly SNAPSHOT_SCROLL_HEADER_OFFSET = 84;

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
    private haptics: HapticFeedbackService,
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
      this.updateActiveSnapshotSection();
    }
  }

  // READING COMPANION: lightweight scroll-spy over the Role Narrative section
  // ids already rendered in the template (read-only DOM lookups, no
  // mutation). Falls back to '' if none are past the reference line yet.
  private updateActiveSnapshotSection(): void {
    const referenceLine = this.SNAPSHOT_SCROLL_HEADER_OFFSET;
    let current = '';
    for (const section of this.snapshotSections) {
      const el = document.getElementById(section.id);
      if (el && el.getBoundingClientRect().top <= referenceLine) {
        current = section.id;
      }
    }
    this.activeSnapshotSectionId = current;
  }

  toggleSnapshotCompanion(): void {
    this.snapshotCompanionOpen = !this.snapshotCompanionOpen;
    this.haptics.selection();
  }

  scrollToSnapshotSection(id: string): void {
    if (!isPlatformBrowser(this.platformId)) { return; }
    const behavior: ScrollBehavior = this.prefersReducedMotion() ? 'auto' : 'smooth';

    if (id === 'role-about') {
      // "Overview" means the very start of the brief -- scroll all the way
      // to the top of the page (hero included), not just to wherever the
      // role-about section itself happens to sit.
      window.scrollTo({ top: 0, behavior });
    } else {
      // Plain scrollIntoView({block:'start'}) lands the section directly
      // under the fixed .gh-public-nav header (68px), hiding its title --
      // compute the real document offset and subtract the header clearance
      // so each section lands fully visible, at "the correct spot".
      const el = document.getElementById(id);
      if (el) {
        const targetTop = el.getBoundingClientRect().top + window.scrollY - this.SNAPSHOT_SCROLL_HEADER_OFFSET;
        window.scrollTo({ top: Math.max(targetTop, 0), behavior });
      }
    }
    this.snapshotCompanionOpen = false;
  }

  private prefersReducedMotion(): boolean {
    if (!isPlatformBrowser(this.platformId) || typeof window.matchMedia !== 'function') { return false; }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
        // SIGNALFRAME PHASE C: soft haptic pulse on a genuine save success,
        // paired with the existing visual saved-state (filled bookmark icon
        // + "Saved" label) so there is zero functional loss without
        // vibration support. HapticFeedbackService no-ops safely on
        // SSR/unsupported browsers/reduced-motion.
        if (this.savedStatus === 'saved') {
          this.haptics.success();
        }
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

  /**
   * Detects when a job description looks like imported privacy/legal boilerplate
   * rather than an actual job description (e.g. Easy Job Posting Assistant imported
   * a privacy policy document instead of the job post). If 2+ known markers are
   * found, show a safe fallback instead of publishing the foreign text publicly.
   * Does NOT rewrite employer content — shows fallback and logs for admin review.
   */
  isPrivacyBoilerplate(text: string | null): boolean {
    if (!text || text.length < 50) { return false; }
    const t = text.toLowerCase();
    const markers = [
      'privacy policy', 'personal information', 'data privacy act',
      'respects your privacy', 'we collect', 'we may collect',
      'information we collect', 'personal data', 'data protection',
      'cookie policy', 'your right to', 'right to access',
      'information you provide', 'third-party services',
      'pursuant to', 'implementing rules', 'confidential all personal',
      'right to be informed', 'data subject', 'processing of personal',
      'national privacy commission', 'privacy notice', 'lawful basis',
    ];
    let hits = 0;
    for (let i = 0; i < markers.length; i++) {
      if (t.indexOf(markers[i]) !== -1) {
        hits++;
        if (hits >= 2) { return true; }
      }
    }
    return false;
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
