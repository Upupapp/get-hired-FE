import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HapticFeedbackService } from '@app-shared/services/haptic-feedback/haptic-feedback.service';
import { PortalFaqItem } from '../shared/portal-faq/portal-faq.component';
import { JobsFacade } from '@main/jobs/state/jobs.facade';
import { PublicPortalAnalyticsService } from '@main/public/services/public-portal-analytics.service';

/** GetHired Public Information Portal -- job seeker page (/job-seekers). */
@Component({
  selector: 'app-job-seeker-portal',
  templateUrl: './job-seeker-portal.component.html',
  styleUrls: ['./job-seeker-portal.component.scss'],
})
export class JobSeekerPortalComponent implements OnInit {
  keyword = '';

  benefits = [
    { title: 'Browse jobs faster', description: 'Search open roles and move directly to the job board.' },
    { title: 'Build one stronger profile', description: 'Organize your skills, experience, education, CV, documents, and videos.' },
    { title: 'Upload your CV once', description: 'Keep your documents ready for applications.' },
    { title: 'Answer video questions', description: 'Some jobs include video questions so you can explain experience in your own words.' },
    { title: 'Understand fit', description: 'Explainable compatibility signals help you understand how your profile relates to a role.' },
    { title: 'Track applications', description: 'Follow your applications from submitted to next steps.' },
    // GETHIRED_JOB_SEEKERS_INFORMATION_PORTAL_VISUAL_UPGRADE -- previously
    // deliberately omitted from this list because the messaging feature
    // had no frontend UI (see the GH1 checkpoint's Feature Truth Audit).
    // A real frontend now exists end-to-end (shared/components/message-thread,
    // wired into the applicant's My Applications page, verified via a
    // live end-to-end smoke test) -- safe to claim truthfully now.
    { title: 'Reply to employers', description: 'Keep employer conversations connected to your applications.' },
    { title: 'Stay in control', description: 'Private preparation stays with you unless you submit it with an application.' },
  ];

  /** GETHIRED PUBLIC PORTAL WOW FACTOR USP UPGRADE -- 3 strongest
   * code-verified differentiators for the job seeker side, copy taken
   * from the approved-safe pillar list. */
  jobSeekerUspPillars = [
    { icon: '/assets/brand/gethired-wow/candidate-profile-card.svg', title: 'Show more than your resume', description: 'Build a profile that helps employers understand you.' },
    { icon: '/assets/brand/gethired-wow/video-answer-orb.svg', title: 'Answer in your own words', description: 'Some jobs include video questions, helping you explain your experience in your own words.' },
    { icon: '/assets/brand/gethired-wow/match-signal-rings.svg', title: 'Understand job fit', description: 'Explainable compatibility signals help you understand fit before you apply.' },
  ];

  faqItems: PortalFaqItem[] = [
    {
      question: 'Can I browse jobs without an account?',
      answer: 'Yes. You can browse public jobs first, then create an account when you\'re ready to apply.',
    },
    {
      question: 'Why should I create a profile?',
      answer: 'Your profile helps organize your skills, work experience, CV, and applications in one place.',
    },
    {
      question: 'Can I apply without completing everything?',
      answer: 'You can apply when the required fields are complete. GetHired may suggest improvements, but guidance does not block you unless the job requires specific information.',
    },
    {
      question: 'Can employers see my CV feedback?',
      answer: 'No. Private readiness and CV coaching guidance stay applicant-side unless a future feature explicitly changes this with your consent.',
    },
    {
      question: 'Are video answers required for every job?',
      answer: 'No. Only some jobs include video questions. You\'ll see this clearly on the job post before you apply.',
    },
    {
      question: 'Are compatibility signals final decisions?',
      answer: 'No. Compatibility signals are guidance to help you and employers understand fit -- they never automatically reject or hide your application.',
    },
  ];

  list$ = this.jobsFacade.jobList$;
  loading$ = this.jobsFacade.loading$;

  constructor(
    private router: Router,
    private titleService: Title,
    private haptics: HapticFeedbackService,
    private jobsFacade: JobsFacade,
    private analytics: PublicPortalAnalyticsService,
  ) {
    this.titleService.setTitle('Find Jobs Online | GetHired Online');
  }

  ngOnInit(): void {
    this.jobsFacade.getPublishedList(undefined);
  }

  searchJobs(): void {
    this.haptics.selection();
    const keyword = (this.keyword || '').trim();
    if (keyword) {
      this.router.navigateByUrl(`/jobs/search/${keyword}`);
    } else {
      this.router.navigateByUrl('/jobs');
    }
  }

  goToJobs(): void {
    this.router.navigateByUrl('/jobs');
  }

  createAccount(): void {
    this.haptics.selection();
    this.router.navigate(['/signup'], { queryParams: { role: 3 } });
  }

  goToSignin(): void {
    this.router.navigateByUrl('/signin');
  }

  onUspSectionViewed(): void {
    this.analytics.trackUspSectionViewed('job_seekers');
  }

  onVideoAnswersSectionViewed(): void {
    this.analytics.trackVideoAnswersSectionViewed('job_seekers');
  }

  onMatchSignalsSectionViewed(): void {
    this.analytics.trackMatchSignalsSectionViewed('job_seekers');
  }

  onWorkspaceSectionViewed(): void {
    this.analytics.trackProfileWorkspaceSectionViewed('job_seekers');
  }

  onFaqOpened(question: string): void {
    this.analytics.trackPortalFaqOpened('job_seekers', question);
  }
}
