import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';

export interface PageMetaConfig {
  title: string;
  description: string;
  robots?: string;        // default: 'index, follow'
  canonical?: string;     // full canonical URL
  ogImage?: string;       // full OG image URL
  ogType?: string;        // default: 'website'
  twitterCard?: string;   // default: 'summary_large_image'
}

export interface OpenGraphConfig {
  title: string;
  description: string;
  type?: string;
  url?: string;
  image?: string;
  siteName?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

const BASE_URL = 'https://gethiredonline.app';
const SITE_NAME = 'GetHired Online';
const DEFAULT_DESCRIPTION =
  'Find jobs, build your profile, post jobs, and manage hiring with GetHired Online — the modern hiring platform for the Philippines.';
const DEFAULT_OG_IMAGE = `${BASE_URL}/assets/brand/gethired-og-default.jpg`;

/**
 * Centralized SEO service for GetHired Online.
 *
 * All document / window access is guarded with isPlatformBrowser so
 * Angular Universal SSR can call every method safely.
 *
 * JSON-LD scripts are injected into <head> by id so they can be
 * replaced or removed on every navigation without accumulating stale
 * tags across route changes.
 *
 * Usage (in any component's ngOnInit):
 *   this.seoService.setPageMeta({ title: '…', description: '…' });
 *   this.seoService.setJobPostingJsonLd(job);   // job detail only
 */
@Injectable({ providedIn: 'root' })
export class SeoService {

  private readonly isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    @Inject(DOCUMENT) private doc: Document,
    private titleService: Title,
    private meta: Meta,
    private router: Router,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Core meta setter — call this once per route
  // ─────────────────────────────────────────────────────────────────────────

  setPageMeta(config: PageMetaConfig): void {
    const {
      title,
      description,
      robots = 'index, follow',
      canonical,
      ogImage = DEFAULT_OG_IMAGE,
      ogType = 'website',
      twitterCard = 'summary_large_image',
    } = config;

    // <title>
    this.titleService.setTitle(title);

    // Standard meta
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: robots });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: ogType });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({
      property: 'og:url',
      content: canonical || `${BASE_URL}${this.router.url}`,
    });
    if (ogImage) {
      this.meta.updateTag({ property: 'og:image', content: ogImage });
      this.meta.updateTag({ property: 'og:image:width', content: '1200' });
      this.meta.updateTag({ property: 'og:image:height', content: '630' });
      this.meta.updateTag({ property: 'og:image:type', content: 'image/jpeg' });
    }

    // Twitter
    this.meta.updateTag({ name: 'twitter:card', content: twitterCard });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    if (ogImage) {
      this.meta.updateTag({ name: 'twitter:image', content: ogImage });
    }

    // Canonical link element — set when provided, clear when omitted
    // so that noindex pages (signin, 404, search results) never carry
    // a stale canonical from the previous route.
    if (canonical) {
      this.setCanonical(canonical);
    } else {
      this.clearCanonical();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Robots
  // ─────────────────────────────────────────────────────────────────────────

  setRobots(index: boolean, follow: boolean): void {
    const directive = `${index ? 'index' : 'noindex'}, ${follow ? 'follow' : 'nofollow'}`;
    this.meta.updateTag({ name: 'robots', content: directive });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Canonical URL
  // ─────────────────────────────────────────────────────────────────────────

  setCanonical(url: string): void {
    // V4 FIX: use Angular's injected DOCUMENT token (safe on SSR + browser).
    // Previously used the bare `document` global — that fails on the server
    // because Angular Universal's renderModule has no globalThis.document.
    // The DOCUMENT injection token is provided by @angular/common and resolves
    // to the server-side DOM stub under Angular Universal, so canonical tags
    // are now emitted in the SSR-rendered HTML seen by Googlebot.
    let link: HTMLLinkElement = this.doc.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /** Remove the canonical <link> element entirely.
   * Called automatically by setPageMeta() when no canonical URL is supplied,
   * so noindex pages (signin, 404, search results) do not inherit a stale
   * canonical from the previously visited route.
   */
  clearCanonical(): void {
    // V4 FIX: use injected DOCUMENT token — SSR-safe, same as setCanonical.
    const link = this.doc.querySelector('link[rel="canonical"]');
    if (link) link.remove();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Open Graph (standalone, for when only OG needs to change)
  // ─────────────────────────────────────────────────────────────────────────

  setOpenGraph(config: OpenGraphConfig): void {
    if (config.title) {
      this.meta.updateTag({ property: 'og:title', content: config.title });
    }
    if (config.description) {
      this.meta.updateTag({ property: 'og:description', content: config.description });
    }
    if (config.type) {
      this.meta.updateTag({ property: 'og:type', content: config.type });
    }
    if (config.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
    }
    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
    }
    if (config.siteName) {
      this.meta.updateTag({ property: 'og:site_name', content: config.siteName });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // JSON-LD management
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Inject or replace a JSON-LD <script> block identified by `id`.
   * Safe to call on every navigation — replaces in-place if already present.
   */
  setJsonLd(id: string, data: object): void {
    // V4 FIX: use injected DOCUMENT token so JSON-LD is emitted by SSR too.
    // Previously guarded with `if (!this.isBrowser) return`, which meant the
    // server-rendered HTML never contained JobPosting/Organization/WebSite LD+JSON.
    // Googlebot fetches the SSR output directly — omitting structured data from
    // it means Google's Rich Results are entirely dependent on client-side JS
    // execution, which is unreliable. Using `this.doc` fixes this without
    // breaking anything browser-side (browser DOCUMENT resolves normally).
    let script: HTMLScriptElement = this.doc.getElementById(id) as HTMLScriptElement;
    if (!script) {
      script = this.doc.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      this.doc.head.appendChild(script);
    }
    script.text = JSON.stringify(data);
  }

  /** Remove a previously injected JSON-LD block by id. */
  clearJsonLd(id: string): void {
    // V4 FIX: use injected DOCUMENT token — SSR-safe.
    const el = this.doc.getElementById(id);
    if (el) el.remove();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Structured data helpers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * JobPosting JSON-LD.  Only called from the PUBLIC job detail page when
   * the job is active (jobStatusId === 2).  All values come from real
   * API data — never fabricated.
   *
   * Fields intentionally OMITTED (no real data available):
   *   - baseSalary  (salary fields exist but may be null)
   *   - validThrough (expirationDate not reliably populated)
   *   - employmentType mapping is not 1:1 with Schema.org enum
   *
   * Fields NEVER included regardless of data:
   *   - hiringOrganization.sameAs (logo / URL unknown without company page)
   *   - applicantLocationRequirements
   *   - jobBenefits
   *   - rating, reviews
   */
  setJobPostingJsonLd(job: any): void {
    if (!job) return;

    const ld: any = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.jobTitle || '',
      description: this.stripHtml(job.jobDescription || '') || job.jobTitle || '',
      datePosted: this.toIso(job.createdAt),
      // FIX: API returns company_name (snake_case); match the same fallback
      // chain used in public-details.component.ts line 41.
      // companyDetails is a bio/description field — only use as last resort.
      hiringOrganization: {
        '@type': 'Organization',
        name: (job as any).company_name || job.companyName || (job as any).companyDetails || '',
        ...(job.companyLogoUrl ? { logo: job.companyLogoUrl } : {}),
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'PH',
          ...(job.jobCity ? { addressLocality: job.jobCity } : {}),
        },
      },
      // Per Google for Jobs spec: signal remote eligibility for the "Remote" badge.
      ...(job.workSetupName && /remote/i.test(job.workSetupName) ? {
        jobLocationType: 'TELECOMMUTE',
        applicantLocationRequirements: { '@type': 'Country', name: 'Philippines' },
      } : {}),
      url: `${BASE_URL}/jobs/details/${job.jobId}`,
      // directApply: true signals that users can apply without leaving this site,
      // enabling the "Apply on site" badge in Google for Jobs.
      directApply: true,
      // identifier helps Google deduplicate this posting across job boards.
      ...(job.jobId ? {
        identifier: {
          '@type': 'PropertyValue',
          name: 'GetHired Online',
          value: job.jobId,
        },
      } : {}),
    };

    // Only include validThrough if an expirationDate exists
    if (job.expirationDate) {
      ld.validThrough = this.toIso(job.expirationDate);
    }

    // Map work setup to Schema.org employmentType when unambiguous
    const empType = this.mapEmploymentType(job.jobTypeName);
    if (empType) {
      ld.employmentType = empType;
    }

    // Salary: only include when both min and max are present and non-zero
    if (job.salaryMinimum && job.salaryMaximum && job.salaryCurrency) {
      // FIX: normalize job.rate to valid Schema.org QuantitativeValue unitText.
      // job.rate may be 'monthly', 'hourly', etc. — not Schema.org-valid as-is.
      // .toUpperCase() alone gives 'HOURLY' which is NOT a valid value; must map.
      const RATE_MAP: Record<string, string> = {
        hourly: 'HOUR', hour: 'HOUR',
        daily: 'DAY', day: 'DAY',
        weekly: 'WEEK', week: 'WEEK',
        monthly: 'MONTH', month: 'MONTH',
        annual: 'YEAR', annually: 'YEAR', yearly: 'YEAR', year: 'YEAR',
      };
      const unitText = RATE_MAP[(job.rate || '').toLowerCase()] || 'MONTH';
      ld.baseSalary = {
        '@type': 'MonetaryAmount',
        currency: job.salaryCurrency,
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salaryMinimum,
          maxValue: job.salaryMaximum,
          unitText,
        },
      };
    }

    this.setJsonLd('gh-jsonld-jobposting', ld);
  }

  clearJobPostingJsonLd(): void {
    this.clearJsonLd('gh-jsonld-jobposting');
  }

  /**
   * Organization JSON-LD for the homepage.
   * Only factual identifiers included — no rating, no review count.
   */
  setOrganizationJsonLd(): void {
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'GetHired Online',
      url: BASE_URL,
      logo: `${BASE_URL}/assets/images/logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        availableLanguage: ['English', 'Filipino'],
      },
    };
    this.setJsonLd('gh-jsonld-org', ld);
  }

  /**
   * WebSite JSON-LD with SearchAction (public job search is available
   * without login via /jobs/search/{keyword}).
   */
  setWebsiteJsonLd(): void {
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'GetHired Online',
      url: BASE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/jobs/search/{search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };
    this.setJsonLd('gh-jsonld-website', ld);
  }

  /**
   * BreadcrumbList JSON-LD.
   * items = [{ name: 'Home', url: 'https://gethiredonline.app/home' }, …]
   */
  setBreadcrumbJsonLd(items: BreadcrumbItem[]): void {
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        item: item.url,
      })),
    };
    this.setJsonLd('gh-jsonld-breadcrumb', ld);
  }

  clearBreadcrumbJsonLd(): void {
    this.clearJsonLd('gh-jsonld-breadcrumb');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Reset to safe defaults (call on navigation away from special pages)
  // ─────────────────────────────────────────────────────────────────────────

  resetToDefaults(): void {
    this.setPageMeta({
      title: `${SITE_NAME} — Jobs and Hiring Platform in the Philippines`,
      description: DEFAULT_DESCRIPTION,
      robots: 'index, follow',
    });
    this.clearJobPostingJsonLd();
    this.clearBreadcrumbJsonLd();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────

  private toIso(value: any): string | undefined {
    if (!value) return undefined;
    try {
      return new Date(value).toISOString();
    } catch {
      return undefined;
    }
  }

  private stripHtml(html: string): string {
    if (!this.isBrowser) {
      // On the server, strip tags with a simple regex; safe because we only
      // use the result in JSON-LD text, not re-rendered HTML.
      return html.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim();
    }
    // SECURE-V3 S1 FIX: Use <textarea> to decode HTML entities without
    // parsing tags or firing inline event handlers (onerror/onload do NOT
    // execute on textarea.innerHTML — unlike div.innerHTML which can fire
    // onerror handlers on <img> tags even when detached from the DOM).
    const ta = this.doc.createElement('textarea');
    ta.innerHTML = html;
    return ta.value.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim();
  }

  private mapEmploymentType(jobTypeName: string | undefined): string | null {
    if (!jobTypeName) return null;
    const n = jobTypeName.toLowerCase();
    if (n.includes('full')) return 'FULL_TIME';
    if (n.includes('part')) return 'PART_TIME';
    // intern check must precede 'contract' to avoid intern matching 'contract'
    if (n.includes('internship') || n.includes('intern')) return 'INTERN';
    if (n.includes('contract') || n.includes('freelance')) return 'CONTRACTOR';
    if (n.includes('temporary') || n.includes('temp')) return 'TEMPORARY';
    if (n.includes('volunteer')) return 'VOLUNTEER';
    // Return OTHER so the field is always present for known-but-unmapped types.
    // Omitting employmentType entirely reduces Google for Jobs eligibility.
    return 'OTHER';
  }
}
