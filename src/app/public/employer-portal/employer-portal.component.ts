import {
  AfterViewInit, Component, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HapticFeedbackService } from '@app-shared/services/haptic-feedback/haptic-feedback.service';
import { PortalFaqItem } from '../shared/portal-faq/portal-faq.component';
import { PublicPortalAnalyticsService } from '@main/public/services/public-portal-analytics.service';
import { SeoService } from '@app-core/services/seo.service';

/** GetHired Employer Site Portal — /employers
 *  Workforce Growth OS conversion page V4.
 *  GETHIRED_EMPLOYER_SITE_PORTAL_WORKFORCE_GROWTH_OS_CONVERSION_REVAMP_V4 */
@Component({
  selector: 'app-employer-portal',
  templateUrl: './employer-portal.component.html',
  styleUrls: ['./employer-portal.component.scss'],
})
export class EmployerPortalComponent implements OnInit, AfterViewInit, OnDestroy {
  // suppress lint for empty analytics stubs

  // ─── Platform snapshot ────────────────────────────────────────────────────
  platformSnapshots = [
    {
      icon: 'create',
      title: 'Create',
      body: 'Start from a file, link, or guided form with GetHired Assistant.',
      color: 'coral',
    },
    {
      icon: 'review',
      title: 'Review',
      body: 'Compare profiles, CVs, documents, answers, and video responses.',
      color: 'azure',
    },
    {
      icon: 'decide',
      title: 'Decide',
      body: 'Use structured information and explainable match signals to shortlist with more context.',
      color: 'violet',
    },
    {
      icon: 'manage',
      title: 'Manage',
      body: 'Track applicants, messages, interviews, and next steps from one workspace.',
      color: 'teal',
    },
  ];

  // ─── "What is GetHired?" ──────────────────────────────────────────────────
  whatIsCards = [
    { title: 'More than a job board', body: 'Post roles and manage applicants after they apply.' },
    { title: 'Built for structured review', body: 'Compare CVs, documents, answers, and video responses in a consistent format.' },
    { title: 'Designed for employer action', body: 'See next steps, message applicants, and move candidates through your hiring process.' },
    { title: 'Ready for smarter job creation', body: 'Use GetHired Assistant to start a draft from a job description file or existing job link where supported.' },
  ];

  // ─── Problem cards ────────────────────────────────────────────────────────
  painPoints = [
    { icon: 'clock', title: 'Job posts take too long to create', description: 'Recruiters already have job descriptions, but still need to rebuild them manually in forms.' },
    { icon: 'scatter', title: 'Applications are everywhere', description: 'CVs, messages, links, documents, and notes get spread across inboxes, chat, spreadsheets, and folders.' },
    { icon: 'compare', title: 'Applicants are hard to compare', description: 'Unstructured submissions make screening slow and inconsistent.' },
    { icon: 'followup', title: 'Follow-ups are manual', description: 'Recruiters lose time tracking who to contact, interview, or update next.' },
    { icon: 'context', title: 'Candidate context is incomplete', description: 'A CV alone may not show communication, motivation, answers, or role-specific fit.' },
    { icon: 'status', title: 'Status is unclear', description: 'Without one pipeline, it is hard to see where every job and applicant stands.' },
  ];

  // ─── Feature grid ─────────────────────────────────────────────────────────
  featureCards = [
    { title: 'Create jobs faster', body: 'Start from a file, link, or guided job form with GetHired Assistant where supported.', icon: 'lightning' },
    { title: 'Post clear job details', body: 'Create job posts with role details, requirements, location, employment type, and applicant expectations.', icon: 'doc' },
    { title: 'Build a company profile', body: 'Show job seekers your company, brand, and hiring identity.', icon: 'building' },
    { title: 'Collect structured applicants', body: 'Receive applicant profiles, CVs, documents, answers, and role-specific information in one place.', icon: 'inbox' },
    { title: 'Use CV Doctor / CV Health', body: 'Support stronger applicant readiness and review context where CV Doctor features are enabled.', icon: 'health' },
    { title: 'Use interview questions', body: 'Add job-specific questions so applicants can respond before review.', icon: 'questions' },
    { title: 'Use video answers', body: 'Ask applicants to submit recorded answers where video helps you understand communication and motivation.', icon: 'video' },
    { title: 'See match signals', body: 'Review explainable decision-support signals. Never treat them as automatic hiring decisions.', icon: 'match' },
    { title: 'Message applicants', body: 'Keep candidate conversations connected to the hiring process.', icon: 'message' },
    { title: 'Manage hiring status', body: 'Track each applicant\'s stage from application to hiring decision.', icon: 'pipeline' },
    { title: 'Track every job', body: 'See open roles, new applicants, and next steps from the employer workspace.', icon: 'jobs' },
    { title: 'Understand plan limits', body: 'Use PlanOS/subscription visibility to understand job limits, entitlements, and billing actions where implemented.', icon: 'plan' },
  ];

  // ─── How it works ─────────────────────────────────────────────────────────
  howItWorksSteps = [
    { num: 1, title: 'Create your employer account', body: 'Start hiring and set up the required employer details.' },
    { num: 2, title: 'Create a job faster', body: 'Use GetHired Assistant to upload a file, paste a link, or continue with the guided form.' },
    { num: 3, title: 'Publish your job', body: 'Review the draft, complete required fields, add questions or video answer settings, and publish.' },
    { num: 4, title: 'Receive applicants', body: 'Job seekers submit profiles, CVs, documents, answers, and video responses where required.' },
    { num: 5, title: 'Review and shortlist', body: 'Use structured applicant information, CV Health, and explainable match signals to review with more context.' },
    { num: 6, title: 'Message and interview', body: 'Contact applicants and move them through your process.' },
    { num: 7, title: 'Track status until hire', body: 'Keep every applicant and job organized in one employer workspace.' },
  ];

  // ─── Structured hiring explainer ─────────────────────────────────────────
  structuredCards = [
    { title: 'Standardized questions', body: 'Ask the same role-specific questions so applicants can be reviewed more consistently.' },
    { title: 'Reviewable answers', body: 'Applicant answers and video responses stay connected to the job.' },
    { title: 'CV Health context', body: 'CV Doctor can help surface applicant readiness signals where supported.' },
    { title: 'Explainable match support', body: 'Signals help explain possible fit, not hide the decision process.' },
    { title: 'Human decision remains central', body: 'Employers stay responsible for review, interviews, and hiring decisions.' },
    { title: 'No hidden automatic hiring', body: 'GetHired does not automatically select, reject, or hide applicants.' },
  ];

  // ─── Trust / security ─────────────────────────────────────────────────────
  trustCards = [
    { title: 'Secure employer workspace', body: 'Keep hiring information inside the employer portal instead of scattered across personal inboxes and folders.' },
    { title: 'Clear applicant records', body: 'Review candidate information from one organized profile.' },
    { title: 'Safe assisted job creation', body: 'Uploaded files and imported links are validated before creating drafts.' },
    { title: 'Explainable signals', body: 'Decision-support signals are designed to be understandable to employers.' },
    { title: 'Candidate-aware process', body: 'Create a clearer application journey for job seekers.' },
    { title: 'Controlled publishing', body: 'Assisted job drafts must be reviewed and approved before going live.' },
  ];

  // ─── FAQ ──────────────────────────────────────────────────────────────────
  faqItems: PortalFaqItem[] = [
    { question: 'What is GetHired for employers?', answer: 'GetHired is an employer hiring workspace where companies can create job posts, reach registered job seekers, review structured applicants, use interview questions and video answers, see explainable match signals, message applicants, and track hiring status in one organized platform.' },
    { question: 'Is GetHired only a job board?', answer: 'No. GetHired includes job posting, but it also helps employers manage applicants after they apply through profiles, CVs, documents, answers, video responses, messaging, match signals, and status tracking.' },
    { question: 'What is Easy Job Posting with GetHired Assistant?', answer: 'Easy Job Posting lets recruiters start a job draft from an uploaded job description file, an existing public job post link, or the regular guided form where supported. The recruiter still reviews and completes the job before publishing.' },
    { question: 'Can GetHired publish a job automatically from my file or link?', answer: 'No. GetHired Assistant creates or prefills a draft only. You review the imported details, complete missing required fields, and approve the job before publishing.' },
    { question: 'What happens if my file or link cannot be read?', answer: 'GetHired will explain the reason — such as unsupported file type, unreadable document, or login-required page. You can try another file, paste another link, or continue manually.' },
    { question: 'What is CV Doctor?', answer: 'CV Doctor is GetHired\'s CV evaluation feature. It helps assess CV quality and readiness where implemented, giving employers and applicants clearer context on profile strength.' },
    { question: 'What is CV Health?', answer: 'CV Health is the result or signal produced by CV Doctor. It communicates CV readiness and improvement areas where available.' },
    { question: 'What are match signals?', answer: 'Match signals are explainable compatibility indicators that help employers review fit faster. They are decision-support signals, not hidden automatic hiring decisions.' },
    { question: 'Can applicants submit video answers?', answer: 'Yes. Employers can ask for video answers when useful, and applicants can submit recorded responses where the job requires them. Video answers are reviewed by people and are never used for automated personality, emotion, or accent scoring.' },
    { question: 'Can I add interview questions to a job?', answer: 'Yes. GetHired preserves job-specific interview questions so applicants can answer before review where the current job creation flow supports it.' },
    { question: 'Can I message applicants?', answer: 'Yes. GetHired supports candidate conversations connected to the hiring process where the existing messaging flow is available.' },
    { question: 'What can I see in the employer dashboard?', answer: 'Employers can manage jobs, review applicants, check applicant information, track statuses, and continue hiring actions from the employer workspace.' },
    { question: 'Can I build a company profile?', answer: 'Yes. GetHired supports company profile setup so candidates can understand the employer behind the job. Public company profile features are shown where implemented.' },
    { question: 'How do I start?', answer: 'Use Start hiring to enter the employer signup flow. If you already have an account, sign in and continue from your employer workspace.' },
    { question: 'How many job seekers can see my jobs?', answer: 'GetHired has 500,000+ registered job seekers across the Philippines who can discover and apply to your published roles.' },
  ];

  // ─── USP pillars (V4 enhanced) ─────────────────────────────────────────
  uspPillars = [
    {
      icon: '/assets/brand/gethired-wow/candidate-profile-card.svg',
      title: 'Review profiles, not scattered attachments',
      description: 'Structured applicant profiles, CVs, documents, and job-specific answers in one place.',
    },
    {
      icon: '/assets/brand/gethired-wow/video-answer-orb.svg',
      title: 'See candidates beyond the CV',
      description: 'Review recorded video answers and interview questions where jobs require them.',
    },
    {
      icon: '/assets/brand/gethired-wow/match-signal-rings.svg',
      title: 'Shortlist with more context, not a black box',
      description: 'Explainable compatibility signals guide review while keeping the hiring decision human-led.',
    },
  ];

  // ─── AI Job Preview Panel state ───────────────────────────────────────────
  aiPanelOpen = false;

  // ─── Mobile menu state ────────────────────────────────────────────────────
  mobileMenuOpen = false;

  private observers: IntersectionObserver[] = [];

  constructor(
    private router: Router,
    private haptics: HapticFeedbackService,
    private analytics: PublicPortalAnalyticsService,
    private seoService: SeoService,
    @Inject(PLATFORM_ID) private platformId: object,
    private zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.seoService.setPageMeta({
      title: 'GetHired for Employers | Post Jobs and Manage Hiring in the Philippines',
      description: 'Post jobs, reach 500,000+ registered job seekers, create job drafts faster with GetHired Assistant, review structured applicants, use CV Doctor, video answers and match signals, and manage hiring in one employer workspace.',
      canonical: 'https://gethiredonline.app/employers',
      robots: 'index, follow',
    });
    this.seoService.setOpenGraph({
      title: 'GetHired for Employers',
      description: 'Post jobs, reach 500,000+ registered job seekers, and manage hiring in one organized workspace for Philippine employers.',
      type: 'website',
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.zone.runOutsideAngular(() => this.initScrollReveal());
  }

  private initScrollReveal(): void {
    const iob = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('ep-revealed');
          iob.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.ep-reveal').forEach(el => iob.observe(el));
    this.observers.push(iob);
  }

  ngOnDestroy(): void {
    this.observers.forEach(o => o.disconnect());
  }

  // ─── Navigation ──────────────────────────────────────────────────────────

  startHiring(): void {
    this.haptics.selection();
    this.aiPanelOpen = true;
    if (this.mobileMenuOpen) this.closeMobileMenu();
  }

  onAiPanelClosed(): void {
    this.aiPanelOpen = false;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  goToSignin(): void {
    this.haptics.selection();
    this.router.navigateByUrl('/signin');
  }

  browseJobs(): void {
    this.router.navigateByUrl('/jobs');
  }

  scrollToSection(sectionId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ─── Mobile menu ─────────────────────────────────────────────────────────

  toggleMobileMenu(): void {
    this.haptics.press();
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
    }
  }

  closeMobileMenu(): void {
    if (!this.mobileMenuOpen) return;
    this.mobileMenuOpen = false;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  onMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.closeMobileMenu();
  }

  // ─── Analytics ───────────────────────────────────────────────────────────

  onUspSectionViewed(): void {
    this.analytics.trackUspSectionViewed('employers');
  }

  onEasyJobPostingViewed(): void {}
  onCvDoctorViewed(): void {}
  onVideoAnswersViewed(): void {}
  onMatchSignalsViewed(): void {}
  onCompanyProfileViewed(): void {}
  onPlanOsViewed(): void {}

  onFaqOpened(question: string): void {
    this.analytics.trackPortalFaqOpened('employers', question);
  }

  onTrustStripViewed(): void {
    this.analytics.trackTrustStripViewed('employers');
  }

  onHowItWorksViewed(): void {
    this.analytics.trackHowItWorksSectionViewed('employers');
  }

  onFinalCtaViewed(): void {}
}
