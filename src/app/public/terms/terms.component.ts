import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SeoService } from '@app-core/services/seo.service';

// SPLIT (Privacy Policy & Terms of Use footer/register link fix): this page
// used to be Sections 18-29 of privacy.component.html, published on the
// same /privacy URL as the Privacy Policy with no separate route of its
// own -- so a footer/register "Terms of Use" link had nowhere standalone
// to point to. Split out here as its own page/route (renumbered 1-12) so
// "Privacy Policy" and "Terms of Use" can be two independent, correctly
// labeled links everywhere they appear. Reuses privacy.component.scss
// directly (same .pp-* layout/typography system) rather than duplicating
// ~700 lines of identical page chrome styling.
@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['../privacy/privacy.component.scss'],
})
export class TermsComponent implements OnInit, OnDestroy {
  readonly isBrowser: boolean;
  activeSection = 'terms-intro';
  lastUpdated = 'July 1, 2026';

  private _tocObserver: any = null;

  readonly tocItems = [
    { id: 'terms-intro', label: 'Acceptance of These Terms' },
    { id: 'terms-eligibility', label: 'Eligibility & Accounts' },
    { id: 'terms-acceptable-use', label: 'Acceptable Use' },
    { id: 'terms-ip', label: 'Intellectual Property' },
    { id: 'terms-content-disclaimer', label: 'Job Postings & Content' },
    { id: 'terms-third-party', label: 'Third-Party Services & Payments' },
    { id: 'terms-disclaimers', label: 'Disclaimers' },
    { id: 'terms-liability', label: 'Limitation of Liability' },
    { id: 'terms-indemnification', label: 'Indemnification' },
    { id: 'terms-termination', label: 'Term & Termination' },
    { id: 'terms-governing-law', label: 'Governing Law & Disputes' },
    { id: 'terms-general', label: 'General Provisions' },
    { id: 'terms-changes', label: 'Changes to These Terms' },
    { id: 'terms-contact', label: 'Contact Us' },
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private seoService: SeoService,
    private cd: ChangeDetectorRef,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.seoService.setPageMeta({
      title: 'Terms of Use | GetHired Online',
      description: 'GetHired\'s Terms of Use: the terms that apply when you use the platform as a job seeker or employer, including acceptable use, intellectual property, disclaimers, and liability.',
      canonical: 'https://gethiredonline.app/terms',
      robots: 'index, follow',
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

  trackById(_i: number, item: { id: string }): string { return item.id; }

  ngOnDestroy(): void {
    if (this._tocObserver) { this._tocObserver.disconnect(); }
  }
}
