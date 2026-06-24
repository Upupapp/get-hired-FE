import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HapticFeedbackService } from '@app-shared/services/haptic-feedback/haptic-feedback.service';
import { PortalFaqItem } from '../shared/portal-faq/portal-faq.component';
import { PublicPortalAnalyticsService } from '@main/public/services/public-portal-analytics.service';

/** GetHired Public Information Portal -- employer page (/employers). */
@Component({
  selector: 'app-employer-portal',
  templateUrl: './employer-portal.component.html',
  styleUrls: ['./employer-portal.component.scss'],
})
export class EmployerPortalComponent {
  painPoints = [
    { title: 'Hiring is scattered', description: 'Applications, messages, and documents spread across channels.' },
    { title: 'Hard to compare applicants', description: 'Unstructured submissions make review slow.' },
    { title: 'Manual follow-ups', description: 'Tracking who to contact next takes real effort.' },
    { title: 'Hard to track hiring status', description: 'No single place to see where every job stands.' },
  ];

  benefits = [
    { title: 'Post jobs quickly', description: 'Guided job posting with clear applicant requirements.' },
    { title: 'Build a company profile', description: 'Show job seekers who you are.' },
    { title: 'Review structured applicants', description: 'CVs, documents, and answers organized by job.' },
    { title: 'Use video answers', description: 'Ask applicants for video answers when useful.' },
    { title: 'See match signals', description: 'Explainable decision-support, never a hidden ranking.' },
    { title: 'Manage hiring status', description: 'Track every applicant\'s stage in one workspace.' },
    { title: 'Track every job', description: 'See open jobs, new applicants, and next steps.' },
  ];

  /** GETHIRED PUBLIC PORTAL WOW FACTOR USP UPGRADE -- 3 strongest
   * code-verified differentiators for the employer side specifically,
   * copy taken from the approved-safe pillar list. */
  employerUspPillars = [
    { icon: '/assets/brand/gethired-wow/candidate-profile-card.svg', title: 'Review profiles, not just resumes', description: 'Compare structured profiles, CVs, and video responses in one place.' },
    { icon: '/assets/brand/gethired-wow/video-answer-orb.svg', title: 'See candidates beyond the CV', description: 'Review recorded video answers where jobs require them.' },
    { icon: '/assets/brand/gethired-wow/match-signal-rings.svg', title: 'Understand fit faster', description: 'Use explainable compatibility signals to guide review without hiding decisions.' },
  ];

  faqItems: PortalFaqItem[] = [
    {
      question: 'Can I create an employer account quickly?',
      answer: 'Yes. Start with a simple account, then complete your company details and post your first job.',
    },
    {
      question: 'Can I post a job right after signup?',
      answer: 'Yes. After your employer account is created, GetHired guides you to complete company setup and post your first job.',
    },
    {
      question: 'What are match signals?',
      answer: 'Match signals are decision-support indicators based on job requirements and submitted applicant information. They do not automatically reject or hide applicants -- hiring decisions stay human-led.',
    },
    {
      question: 'Can applicants submit video answers?',
      answer: 'Yes, if the job/application flow supports video questions. Video answers are reviewed by people and are not used for facial, voice, accent, emotion, or personality scoring.',
    },
  ];

  constructor(
    private router: Router,
    private titleService: Title,
    private haptics: HapticFeedbackService,
    private analytics: PublicPortalAnalyticsService,
  ) {
    this.titleService.setTitle('Hire Employees Online | GetHired for Employers');
  }

  startHiring(): void {
    this.haptics.selection();
    this.router.navigate(['/signup'], { queryParams: { role: 2 } });
  }

  goToSignin(): void {
    this.router.navigateByUrl('/signin');
  }

  onUspSectionViewed(): void {
    this.analytics.trackUspSectionViewed('employers');
  }

  onFaqOpened(question: string): void {
    this.analytics.trackPortalFaqOpened('employers', question);
  }
}
