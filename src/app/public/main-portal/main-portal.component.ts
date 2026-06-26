import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HapticFeedbackService } from '@app-shared/services/haptic-feedback/haptic-feedback.service';
import { CoreService } from '@app-core/services/core.service';
import { PublicPortalAnalyticsService } from '@main/public/services/public-portal-analytics.service';
import { SeoService } from '@app-core/services/seo.service';

/**
 * GetHired Public Information Portal -- main role-selection page (GETHIRED
 * PORTAL v2). Replaces the previous `redirectTo: 'jobs'` at the empty path
 * -- /jobs itself is completely untouched and still works exactly as
 * before, just no longer the thing visitors land on by default.
 *
 * Redirect-if-logged-in (so an authenticated user lands on their own
 * dashboard instead of this marketing portal) is handled here in
 * ngOnInit, not via a router canActivate guard -- confirmed empirically
 * that attaching a guard to this exact empty-path leaf route broke
 * Angular 13's router (the component silently never activated, no
 * error, while sibling non-empty routes like /jobs worked fine). Plain
 * imperative redirect avoids that router-matching edge case entirely.
 */
@Component({
  selector: 'app-main-portal',
  templateUrl: './main-portal.component.html',
  styleUrls: ['./main-portal.component.scss'],
})
export class MainPortalComponent implements OnInit {
  /** GETHIRED PUBLIC PORTAL WOW FACTOR USP UPGRADE -- the 4 strongest
   * code-verified differentiators, each copy line taken directly from
   * the approved-safe pillar list (see
   * GETHIRED_PUBLIC_PORTAL_WOW_COPY_SYSTEM.md). Icons are local SVGs
   * from src/assets/brand/gethired-wow/, not external/stock images. */
  uspPillars = [
    { icon: '/assets/brand/gethired-wow/candidate-profile-card.svg', title: 'Stronger profiles', description: 'Build one profile with your skills, CV, work history, and video answers.' },
    { icon: '/assets/brand/gethired-wow/video-answer-orb.svg', title: 'Video answers', description: 'Some jobs include video questions, helping candidates explain their experience in their own words.' },
    { icon: '/assets/brand/gethired-wow/match-signal-rings.svg', title: 'Explainable match signals', description: 'Compatibility signals are guidance, not automatic decisions -- they help teams understand fit without hiding decisions.' },
    { icon: '/assets/brand/gethired-wow/hiring-pipeline-lines.svg', title: 'Higher hiring confidence', description: 'Review richer candidate context -- profiles, CVs, and video answers -- before deciding who to move forward.' },
  ];

  /** Icons are plain Unicode glyphs, not an icon library or images --
   * keeps this additive without introducing a new dependency. */
  differentiators = [
    { icon: '📄', title: 'Structured profiles', description: 'Skills, work history, education, documents, and videos organized in one profile.' },
    { icon: '📎', title: 'CV and resume support', description: 'Upload once and reuse your documents across applications.' },
    { icon: '🧭', title: 'Job compatibility signals', description: 'Explainable job signals help people understand fit without hiding decisions.' },
    { icon: '🎥', title: 'Video answers', description: 'Some jobs support video questions reviewed by real people.' },
    { icon: '📋', title: 'Application tracking', description: 'Job seekers can follow the status of their applications in one place.' },
    { icon: '🗂️', title: 'Employer dashboard', description: 'Employers can manage jobs, applicants, and hiring progress in one workspace.' },
  ];

  jobSeekerJourney = [
    { title: 'Create your profile', description: 'Add your skills, work history, and education.' },
    { title: 'Upload CV and documents', description: 'Upload once and reuse them across applications.' },
    { title: 'Find jobs', description: 'Search roles that match what you are looking for.' },
    { title: 'Apply and track status', description: 'See the status of every application in one place.' },
    { title: 'Answer video questions where required', description: 'Some jobs include video questions, reviewed by people.' },
  ];

  employerJourney = [
    { title: 'Create employer account', description: 'Set up your account in a few minutes.' },
    { title: 'Complete company profile', description: 'Help candidates understand who is hiring.' },
    { title: 'Post your job', description: 'Describe the role and the skills you need.' },
    { title: 'Review applicants', description: 'See who applied and their submitted information.' },
    { title: 'Message or interview candidates', description: 'Keep communication connected to the hiring process.' },
    { title: 'Hire with confidence', description: 'Move forward once you have found the right fit.' },
  ];

  /** Active tab in the Product Preview section. */
  activePreviewTab: string = 'seeker';

  readonly previewTabs = ['seeker', 'employer', 'tracking', 'video', 'signals'];

  @ViewChild('tablistRef') private tablistRef: ElementRef<HTMLElement>;

  /** Proof chips shown in the hero — brief, honest feature labels. */
  heroProofChips = [
    'Structured profiles',
    'Video answers',
    'Employer dashboard',
    'Application tracking',
  ];

  constructor(
    private router: Router,
    private haptics: HapticFeedbackService,
    private coreService: CoreService,
    private analytics: PublicPortalAnalyticsService,
    private seoService: SeoService,
  ) { }

  ngOnInit(): void {
    this.seoService.setPageMeta({
      title: 'GetHired Online — Jobs and Hiring Platform in the Philippines',
      description: 'Find jobs, build your profile, post jobs, and manage hiring with GetHired Online — the modern hiring platform for the Philippines.',
      canonical: 'https://gethiredonline.app/home',
      robots: 'index, follow',
    });
    this.seoService.setOrganizationJsonLd();
    this.seoService.setWebsiteJsonLd();

    if (this.coreService.isLoggedIn()) {
      this.coreService.getRole().then((role: string) => {
        switch (role) {
          case '1': this.router.navigateByUrl('/admin'); break;
          case '2': this.router.navigateByUrl('/recruiter'); break;
          case '3': this.router.navigateByUrl('/user'); break;
        }
      });
    }
  }

  setPreviewTab(tab: string): void {
    this.activePreviewTab = tab;
    this.analytics.trackProductPreviewTabClicked(tab, 'home');
  }

  onTabKeydown(event: KeyboardEvent): void {
    const tabs = this.previewTabs;
    const currentIdx = tabs.indexOf(this.activePreviewTab);
    let nextIdx: number | null = null;

    switch (event.key) {
      case 'ArrowRight': nextIdx = (currentIdx + 1) % tabs.length; break;
      case 'ArrowLeft': nextIdx = (currentIdx - 1 + tabs.length) % tabs.length; break;
      case 'Home': nextIdx = 0; break;
      case 'End': nextIdx = tabs.length - 1; break;
      default: return;
    }

    event.preventDefault();
    const nextTab = tabs[nextIdx];
    this.setPreviewTab(nextTab);
    if (this.tablistRef) {
      const btn = this.tablistRef.nativeElement.querySelector(`#tab-${nextTab}`) as HTMLElement;
      if (btn) { btn.focus(); }
    }
  }

  goToJobSeekerPortal(): void {
    this.haptics.selection();
    this.router.navigateByUrl('/job-seekers');
  }

  goToEmployerPortal(): void {
    this.haptics.selection();
    this.router.navigateByUrl('/employers');
  }

  goToJobs(): void {
    this.router.navigateByUrl('/jobs');
  }

  goToSignin(): void {
    this.router.navigateByUrl('/signin');
  }

  heroCTAFindJobs(): void {
    this.analytics.trackHeroCTAClicked('find_jobs', 'home');
    this.goToJobs();
  }

  heroCTAStartHiring(): void {
    this.analytics.trackHeroCTAClicked('start_hiring', 'home');
    this.goToEmployerPortal();
  }

  finalCTAFindJobs(): void {
    this.analytics.trackFinalCTAClicked('find_jobs', 'home');
    this.goToJobs();
  }

  finalCTAStartHiring(): void {
    this.analytics.trackFinalCTAClicked('start_hiring', 'home');
    this.goToEmployerPortal();
  }

  onUspSectionViewed(): void {
    this.analytics.trackUspSectionViewed('home');
  }

  onProductPreviewViewed(): void {
    this.analytics.trackProductPreviewSectionViewed('home');
  }

  onTrustSectionViewed(): void {
    this.analytics.trackTrustSafetySectionViewed('home');
  }

  onEmployerBandViewed(): void {
    this.analytics.trackEmployerConversionBandViewed('home');
  }

  /** TrackBy helpers for static lists — prevents DOM re-creation on
   *  any future change detection passes. Index is sufficient here
   *  because all four arrays are module-level constants (never mutated). */
  trackByIndex(index: number): number {
    return index;
  }
}
