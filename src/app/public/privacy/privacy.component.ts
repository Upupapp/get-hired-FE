import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SeoService } from '@app-core/services/seo.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
})
export class PrivacyComponent implements OnInit, OnDestroy {
  readonly isBrowser: boolean;
  activeSection = 'overview';
  lastUpdated = 'July 1, 2026';

  requestForm: FormGroup;
  submitting = false;
  submitted = false;
  submitError = '';

  private _tocObserver: any = null;

  readonly requestTypes = [
    { value: 'access', label: 'Access my data' },
    { value: 'correction', label: 'Correct my data' },
    { value: 'deletion', label: 'Delete my data' },
    { value: 'portability', label: 'Export / data portability' },
    { value: 'objection', label: 'Object to processing' },
    { value: 'withdraw_consent', label: 'Withdraw consent' },
    { value: 'account_privacy', label: 'Account privacy question' },
    { value: 'employer_data', label: 'Employer data request' },
    { value: 'security_concern', label: 'Security concern' },
    { value: 'other', label: 'Other' },
  ];

  readonly roles = [
    { value: 'job_seeker', label: 'Job seeker / applicant' },
    { value: 'employer', label: 'Employer / recruiter' },
    { value: 'visitor', label: 'Visitor (no account)' },
    { value: 'other', label: 'Other' },
  ];

  readonly tocItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'data-we-collect', label: 'Data We Collect' },
    { id: 'how-we-collect', label: 'How We Collect Data' },
    { id: 'how-we-use', label: 'How We Use Data' },
    { id: 'applications-employers', label: 'Job Applications & Employers' },
    { id: 'employer-responsibilities', label: 'Employer Responsibilities' },
    { id: 'ai-tools', label: 'CV Doctor, Match & AI' },
    { id: 'cookies', label: 'Cookies & Analytics' },
    { id: 'sharing', label: 'How We Share Data' },
    { id: 'retention', label: 'Retention' },
    { id: 'security', label: 'Security' },
    { id: 'your-rights', label: 'Your Rights' },
    { id: 'contact-privacy', label: 'Privacy Requests' },
    { id: 'international', label: 'International Processing' },
    { id: 'minors', label: 'Children & Minors' },
    { id: 'third-party', label: 'Third-Party Links' },
    { id: 'user-responsibilities', label: 'User Responsibilities' },
    { id: 'changes', label: 'Changes to This Policy' },
    { id: 'contact', label: 'Contact Us' },
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private seoService: SeoService,
    private fb: FormBuilder,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.seoService.setPageMeta({
      title: 'Privacy Policy | GetHired Online',
      description: 'Read how GetHired collects, uses, shares, protects, and retains personal data for job seekers, employers, applications, CV Health, match signals, messaging, and hiring services.',
      canonical: 'https://gethiredonline.app/privacy',
      robots: 'index, follow',
    });

    this.requestForm = this.fb.group({
      request_type: ['', Validators.required],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      role: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      related_account_email: ['', [Validators.email, Validators.maxLength(200)]],
      consent_to_contact: [false, Validators.requiredTrue],
    });

    if (this.isBrowser) {
      setTimeout(() => this.setupTOC(), 400);
    }
  }

  private setupTOC(): void {
    if (!this.isBrowser || typeof IntersectionObserver === 'undefined') { return; }
    const sections = document.querySelectorAll('.pp-section[id]');
    this._tocObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            this.activeSection = (e.target as HTMLElement).id;
            this.cd.markForCheck();
            break;
          }
        }
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 },
    );
    sections.forEach(s => this._tocObserver.observe(s));
  }

  scrollTo(id: string, event: Event): void {
    event.preventDefault();
    this.activeSection = id;
    if (!this.isBrowser) { return; }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  submitRequest(): void {
    if (this.requestForm.invalid || this.submitting) { return; }
    this.submitting = true;
    this.submitError = '';
    this.cd.markForCheck();
    this.http.post(`${environment.api_url}/privacy/request`, this.requestForm.value).subscribe({
      next: () => {
        this.submitted = true;
        this.submitting = false;
        this.cd.markForCheck();
      },
      error: () => {
        this.submitError = "We couldn’t submit your request. Please try again or email us directly.";
        this.submitting = false;
        this.cd.markForCheck();
      },
    });
  }

  trackById(_i: number, item: { id: string }): string { return item.id; }

  ngOnDestroy(): void {
    if (this._tocObserver) { this._tocObserver.disconnect(); }
  }
}
