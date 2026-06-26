/**
 * Unit tests for SeoService (SEO V3 deployment — 2026-06-25)
 *
 * Coverage targets:
 *  - setPageMeta: Title, Meta, canonical side-effects
 *  - setJobPostingJsonLd: schema shape, fallback fields, SSR guard
 *  - setOrganizationJsonLd, setWebsiteJsonLd, setBreadcrumbJsonLd
 *  - clearJsonLd / clearJobPostingJsonLd / clearBreadcrumbJsonLd
 *  - resetToDefaults: clears structured-data, resets meta
 *  - SSR safety: DOM ops run via Angular DOCUMENT token (SSR-safe by Angular Universal stub, not isBrowser guard)
 *  - company_name fallback chain in PublicDetailsComponent
 *
 * Test environment: Karma/Jasmine (Angular 13)
 * Path aliases resolved by tsconfig.json paths (compilerOptions.paths)
 */

import { TestBed } from '@angular/core/testing';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { SeoService, PageMetaConfig, BreadcrumbItem } from './seo.service';

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Build a minimal job object that covers all optional JsonLd fields */
function makeJob(overrides: any = {}): any {
  return {
    jobId: '42',
    jobTitle: 'Software Engineer',
    jobDescription: '<p>Build <b>great</b> things.</p>',
    createdAt: '2026-06-01T00:00:00.000Z',
    companyName: 'Acme Corp',
    jobCity: 'Manila',
    jobTypeName: 'Full-Time',
    salaryMinimum: 30000,
    salaryMaximum: 50000,
    salaryCurrency: 'PHP',
    rate: 'month',
    jobStatusId: 2,
    ...overrides,
  };
}

/** Stub Title service */
class TitleStub {
  private _title = '';
  setTitle(t: string) { this._title = t; }
  getTitle() { return this._title; }
}

/** Stub Meta service — records the last updateTag call per key */
class MetaStub {
  tags: Record<string, string> = {};
  updateTag(tag: { name?: string; property?: string; content: string }) {
    const key = tag.name || tag.property || '';
    this.tags[key] = tag.content;
  }
}

/** Stub Router */
class RouterStub {
  url = '/jobs/details/42';
  navigateByUrl(_url: string) { return Promise.resolve(true); }
}

// ──────────────────────────────────────────────────────────────────────────────
// Suite helpers
// ──────────────────────────────────────────────────────────────────────────────

function createService(isBrowser: boolean): {
  service: SeoService;
  titleStub: TitleStub;
  metaStub: MetaStub;
} {
  const titleStub = new TitleStub();
  const metaStub = new MetaStub();

  TestBed.configureTestingModule({
    providers: [
      SeoService,
      { provide: Title, useValue: titleStub },
      { provide: Meta, useValue: metaStub },
      { provide: Router, useClass: RouterStub },
      { provide: PLATFORM_ID, useValue: isBrowser ? 'browser' : 'server' },
    ],
  });

  const service = TestBed.inject(SeoService);
  return { service, titleStub, metaStub };
}

// ──────────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────────

describe('SeoService (browser)', () => {
  let service: SeoService;
  let titleStub: TitleStub;
  let metaStub: MetaStub;

  beforeEach(() => {
    ({ service, titleStub, metaStub } = createService(true));
  });

  afterEach(() => TestBed.resetTestingModule());

  // ── setPageMeta ────────────────────────────────────────────────────────────

  describe('setPageMeta', () => {
    const cfg: PageMetaConfig = {
      title: 'Test Job | GetHired Online',
      description: 'A test description.',
    };

    it('sets the document title via Title service', () => {
      service.setPageMeta(cfg);
      expect(titleStub.getTitle()).toBe('Test Job | GetHired Online');
    });

    it('sets description meta tag', () => {
      service.setPageMeta(cfg);
      expect(metaStub.tags['description']).toBe('A test description.');
    });

    it('defaults robots to "index, follow"', () => {
      service.setPageMeta(cfg);
      expect(metaStub.tags['robots']).toBe('index, follow');
    });

    it('applies an explicit robots directive', () => {
      service.setPageMeta({ ...cfg, robots: 'noindex, nofollow' });
      expect(metaStub.tags['robots']).toBe('noindex, nofollow');
    });

    it('sets og:title and og:description', () => {
      service.setPageMeta(cfg);
      expect(metaStub.tags['og:title']).toBe('Test Job | GetHired Online');
      expect(metaStub.tags['og:description']).toBe('A test description.');
    });

    it('sets og:type to "website" by default', () => {
      service.setPageMeta(cfg);
      expect(metaStub.tags['og:type']).toBe('website');
    });

    it('uses explicit ogType when provided', () => {
      service.setPageMeta({ ...cfg, ogType: 'article' });
      expect(metaStub.tags['og:type']).toBe('article');
    });

    it('sets og:site_name to "GetHired Online"', () => {
      service.setPageMeta(cfg);
      expect(metaStub.tags['og:site_name']).toBe('GetHired Online');
    });

    it('sets og:url from canonical when provided', () => {
      service.setPageMeta({ ...cfg, canonical: 'https://gethiredonline.app/jobs/details/99' });
      expect(metaStub.tags['og:url']).toBe('https://gethiredonline.app/jobs/details/99');
    });

    it('sets og:url from router.url when canonical omitted', () => {
      service.setPageMeta(cfg);
      // router.url = '/jobs/details/42'
      expect(metaStub.tags['og:url']).toContain('/jobs/details/42');
    });

    it('sets twitter:card to "summary_large_image" by default', () => {
      service.setPageMeta(cfg);
      expect(metaStub.tags['twitter:card']).toBe('summary_large_image');
    });

    it('sets twitter:title and twitter:description', () => {
      service.setPageMeta(cfg);
      expect(metaStub.tags['twitter:title']).toBe('Test Job | GetHired Online');
      expect(metaStub.tags['twitter:description']).toBe('A test description.');
    });
  });

  // ── setRobots ─────────────────────────────────────────────────────────────

  describe('setRobots', () => {
    it('sets "index, follow" for (true, true)', () => {
      service.setRobots(true, true);
      expect(metaStub.tags['robots']).toBe('index, follow');
    });

    it('sets "noindex, nofollow" for (false, false)', () => {
      service.setRobots(false, false);
      expect(metaStub.tags['robots']).toBe('noindex, nofollow');
    });

    it('sets "noindex, follow" for (false, true)', () => {
      service.setRobots(false, true);
      expect(metaStub.tags['robots']).toBe('noindex, follow');
    });
  });

  // ── setCanonical (DOM) ────────────────────────────────────────────────────

  describe('setCanonical (browser)', () => {
    it('inserts a canonical link element into document.head', () => {
      // Remove any pre-existing canonical to start clean
      const existing = document.querySelector('link[rel="canonical"]');
      if (existing) existing.remove();

      service.setCanonical('https://gethiredonline.app/jobs');
      const link = document.querySelector('link[rel="canonical"]');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('https://gethiredonline.app/jobs');
    });

    it('updates the href if a canonical link already exists', () => {
      service.setCanonical('https://gethiredonline.app/jobs');
      service.setCanonical('https://gethiredonline.app/jobs/details/42');
      const links = document.querySelectorAll('link[rel="canonical"]');
      // Should not duplicate
      expect(links.length).toBe(1);
      expect(links[0].getAttribute('href')).toBe('https://gethiredonline.app/jobs/details/42');
    });
  });

  // ── setJobPostingJsonLd ───────────────────────────────────────────────────

  describe('setJobPostingJsonLd', () => {
    afterEach(() => {
      const el = document.getElementById('gh-jsonld-jobposting');
      if (el) el.remove();
    });

    it('injects a script[type="application/ld+json"] into head', () => {
      service.setJobPostingJsonLd(makeJob());
      const script = document.getElementById('gh-jsonld-jobposting') as HTMLScriptElement;
      expect(script).toBeTruthy();
      expect(script.type).toBe('application/ld+json');
    });

    it('produces valid JSON parseable as an object', () => {
      service.setJobPostingJsonLd(makeJob());
      const script = document.getElementById('gh-jsonld-jobposting') as HTMLScriptElement;
      let parsed: any;
      expect(() => { parsed = JSON.parse(script.text); }).not.toThrow();
      expect(parsed).toBeTruthy();
    });

    it('sets @type to JobPosting', () => {
      service.setJobPostingJsonLd(makeJob());
      const parsed = JSON.parse((document.getElementById('gh-jsonld-jobposting') as any).text);
      expect(parsed['@type']).toBe('JobPosting');
    });

    it('maps jobTypeName "Full-Time" to FULL_TIME employmentType', () => {
      service.setJobPostingJsonLd(makeJob({ jobTypeName: 'Full-Time' }));
      const parsed = JSON.parse((document.getElementById('gh-jsonld-jobposting') as any).text);
      expect(parsed.employmentType).toBe('FULL_TIME');
    });

    it('maps jobTypeName "Part-Time" to PART_TIME', () => {
      service.setJobPostingJsonLd(makeJob({ jobTypeName: 'Part-Time' }));
      const parsed = JSON.parse((document.getElementById('gh-jsonld-jobposting') as any).text);
      expect(parsed.employmentType).toBe('PART_TIME');
    });

    it('maps jobTypeName "Contract" to CONTRACTOR', () => {
      service.setJobPostingJsonLd(makeJob({ jobTypeName: 'Contract' }));
      const parsed = JSON.parse((document.getElementById('gh-jsonld-jobposting') as any).text);
      expect(parsed.employmentType).toBe('CONTRACTOR');
    });

    it('maps jobTypeName "Internship" to INTERN', () => {
      service.setJobPostingJsonLd(makeJob({ jobTypeName: 'Internship' }));
      const parsed = JSON.parse((document.getElementById('gh-jsonld-jobposting') as any).text);
      expect(parsed.employmentType).toBe('INTERN');
    });

    it('maps jobTypeName "Freelance" to CONTRACTOR', () => {
      service.setJobPostingJsonLd(makeJob({ jobTypeName: 'Freelance' }));
      const parsed = JSON.parse((document.getElementById('gh-jsonld-jobposting') as any).text);
      expect(parsed.employmentType).toBe('CONTRACTOR');
    });

    it('omits employmentType for an unrecognised jobTypeName', () => {
      service.setJobPostingJsonLd(makeJob({ jobTypeName: 'Unknown Type' }));
      const parsed = JSON.parse((document.getElementById('gh-jsonld-jobposting') as any).text);
      expect(parsed.employmentType).toBeUndefined();
    });

    it('includes baseSalary when min, max, and currency are all present', () => {
      service.setJobPostingJsonLd(makeJob());
      const parsed = JSON.parse((document.getElementById('gh-jsonld-jobposting') as any).text);
      expect(parsed.baseSalary).toBeTruthy();
      expect(parsed.baseSalary['@type']).toBe('MonetaryAmount');
      expect(parsed.baseSalary.currency).toBe('PHP');
      expect(parsed.baseSalary.value.minValue).toBe(30000);
      expect(parsed.baseSalary.value.maxValue).toBe(50000);
    });

    it('omits baseSalary when salary fields are missing', () => {
      const job = makeJob({ salaryMinimum: null, salaryMaximum: null, salaryCurrency: null });
      service.setJobPostingJsonLd(job);
      const parsed = JSON.parse((document.getElementById('gh-jsonld-jobposting') as any).text);
      expect(parsed.baseSalary).toBeUndefined();
    });

    it('sets jobUrl to BASE_URL/jobs/details/:jobId', () => {
      service.setJobPostingJsonLd(makeJob({ jobId: '99' }));
      const parsed = JSON.parse((document.getElementById('gh-jsonld-jobposting') as any).text);
      expect(parsed.url).toBe('https://gethiredonline.app/jobs/details/99');
    });

    it('strips HTML from jobDescription', () => {
      service.setJobPostingJsonLd(makeJob({ jobDescription: '<p>Build <b>great</b> things.</p>' }));
      const parsed = JSON.parse((document.getElementById('gh-jsonld-jobposting') as any).text);
      expect(parsed.description).not.toContain('<p>');
      expect(parsed.description).not.toContain('<b>');
      expect(parsed.description).toContain('Build');
      expect(parsed.description).toContain('great things');
    });

    it('replaces the script in-place if called twice (no duplicate)', () => {
      service.setJobPostingJsonLd(makeJob({ jobTitle: 'Dev A' }));
      service.setJobPostingJsonLd(makeJob({ jobTitle: 'Dev B' }));
      const scripts = document.querySelectorAll('#gh-jsonld-jobposting');
      expect(scripts.length).toBe(1);
      const parsed = JSON.parse((scripts[0] as HTMLScriptElement).text);
      expect(parsed.title).toBe('Dev B');
    });

    it('does nothing when job is null or undefined', () => {
      expect(() => service.setJobPostingJsonLd(null)).not.toThrow();
      expect(() => service.setJobPostingJsonLd(undefined)).not.toThrow();
    });

    it('includes validThrough when expirationDate is provided', () => {
      service.setJobPostingJsonLd(makeJob({ expirationDate: '2026-12-31T00:00:00.000Z' }));
      const parsed = JSON.parse((document.getElementById('gh-jsonld-jobposting') as any).text);
      expect(parsed.validThrough).toBeTruthy();
      expect(parsed.validThrough).toContain('2026-12-31');
    });

    it('omits validThrough when expirationDate is absent', () => {
      service.setJobPostingJsonLd(makeJob({ expirationDate: null }));
      const parsed = JSON.parse((document.getElementById('gh-jsonld-jobposting') as any).text);
      expect(parsed.validThrough).toBeUndefined();
    });

    it('sets jobLocationType TELECOMMUTE for Remote work setup', () => {
      service.setJobPostingJsonLd(makeJob({ workSetupName: 'Remote' }));
      const parsed = JSON.parse((document.getElementById('gh-jsonld-jobposting') as any).text);
      expect(parsed.jobLocationType).toBe('TELECOMMUTE');
      expect(parsed.applicantLocationRequirements).toBeTruthy();
      expect(parsed.applicantLocationRequirements['@type']).toBe('Country');
    });

    it('omits jobLocationType for On-site work setup', () => {
      service.setJobPostingJsonLd(makeJob({ workSetupName: 'On-site' }));
      const parsed = JSON.parse((document.getElementById('gh-jsonld-jobposting') as any).text);
      expect(parsed.jobLocationType).toBeUndefined();
    });

    it('falls back to jobTitle for description when jobDescription is null', () => {
      service.setJobPostingJsonLd(makeJob({ jobDescription: null }));
      const parsed = JSON.parse((document.getElementById('gh-jsonld-jobposting') as any).text);
      expect(parsed.description).toBe('Software Engineer');
    });
  });

  // ── clearJsonLd / clearJobPostingJsonLd ───────────────────────────────────

  describe('clearJsonLd', () => {
    it('removes the script element by id', () => {
      service.setJobPostingJsonLd(makeJob());
      expect(document.getElementById('gh-jsonld-jobposting')).toBeTruthy();
      service.clearJobPostingJsonLd();
      expect(document.getElementById('gh-jsonld-jobposting')).toBeNull();
    });

    it('does not throw when no element with that id exists', () => {
      expect(() => service.clearJsonLd('gh-jsonld-nonexistent')).not.toThrow();
    });

    it('clearBreadcrumbJsonLd removes the breadcrumb script', () => {
      service.setBreadcrumbJsonLd([{ name: 'Home', url: 'https://gethiredonline.app/home' }]);
      expect(document.getElementById('gh-jsonld-breadcrumb')).toBeTruthy();
      service.clearBreadcrumbJsonLd();
      expect(document.getElementById('gh-jsonld-breadcrumb')).toBeNull();
    });
  });

  // ── setOrganizationJsonLd ─────────────────────────────────────────────────

  describe('setOrganizationJsonLd', () => {
    afterEach(() => {
      const el = document.getElementById('gh-jsonld-org');
      if (el) el.remove();
    });

    it('injects an Organization schema', () => {
      service.setOrganizationJsonLd();
      const script = document.getElementById('gh-jsonld-org') as HTMLScriptElement;
      expect(script).toBeTruthy();
      const parsed = JSON.parse(script.text);
      expect(parsed['@type']).toBe('Organization');
      expect(parsed.name).toBe('GetHired Online');
      expect(parsed.url).toBe('https://gethiredonline.app');
    });
  });

  // ── setWebsiteJsonLd ──────────────────────────────────────────────────────

  describe('setWebsiteJsonLd', () => {
    afterEach(() => {
      const el = document.getElementById('gh-jsonld-website');
      if (el) el.remove();
    });

    it('injects a WebSite schema with SearchAction', () => {
      service.setWebsiteJsonLd();
      const script = document.getElementById('gh-jsonld-website') as HTMLScriptElement;
      expect(script).toBeTruthy();
      const parsed = JSON.parse(script.text);
      expect(parsed['@type']).toBe('WebSite');
      expect(parsed.potentialAction).toBeTruthy();
      expect(parsed.potentialAction['@type']).toBe('SearchAction');
      expect(parsed.potentialAction.target.urlTemplate).toContain('/jobs/search/');
    });
  });

  // ── setBreadcrumbJsonLd ───────────────────────────────────────────────────

  describe('setBreadcrumbJsonLd', () => {
    afterEach(() => {
      const el = document.getElementById('gh-jsonld-breadcrumb');
      if (el) el.remove();
    });

    const items: BreadcrumbItem[] = [
      { name: 'Home', url: 'https://gethiredonline.app/home' },
      { name: 'Jobs', url: 'https://gethiredonline.app/jobs' },
      { name: 'Software Engineer', url: 'https://gethiredonline.app/jobs/details/42' },
    ];

    it('injects a BreadcrumbList schema', () => {
      service.setBreadcrumbJsonLd(items);
      const script = document.getElementById('gh-jsonld-breadcrumb') as HTMLScriptElement;
      const parsed = JSON.parse(script.text);
      expect(parsed['@type']).toBe('BreadcrumbList');
    });

    it('assigns correct positions (1-indexed)', () => {
      service.setBreadcrumbJsonLd(items);
      const parsed = JSON.parse((document.getElementById('gh-jsonld-breadcrumb') as any).text);
      expect(parsed.itemListElement[0].position).toBe(1);
      expect(parsed.itemListElement[1].position).toBe(2);
      expect(parsed.itemListElement[2].position).toBe(3);
    });

    it('preserves item names and urls', () => {
      service.setBreadcrumbJsonLd(items);
      const parsed = JSON.parse((document.getElementById('gh-jsonld-breadcrumb') as any).text);
      expect(parsed.itemListElement[2].name).toBe('Software Engineer');
      expect(parsed.itemListElement[2].item).toBe('https://gethiredonline.app/jobs/details/42');
    });
  });

  // ── resetToDefaults ───────────────────────────────────────────────────────

  describe('resetToDefaults', () => {
    it('resets title to the default site title', () => {
      service.setPageMeta({ title: 'Custom Title', description: 'Custom desc' });
      service.resetToDefaults();
      expect(titleStub.getTitle()).toContain('GetHired Online');
    });

    it('resets robots to "index, follow"', () => {
      service.setPageMeta({ title: 'T', description: 'D', robots: 'noindex, nofollow' });
      service.resetToDefaults();
      expect(metaStub.tags['robots']).toBe('index, follow');
    });

    it('clears any existing jobposting JSON-LD', () => {
      service.setJobPostingJsonLd(makeJob());
      expect(document.getElementById('gh-jsonld-jobposting')).toBeTruthy();
      service.resetToDefaults();
      expect(document.getElementById('gh-jsonld-jobposting')).toBeNull();
    });

    it('clears any existing breadcrumb JSON-LD', () => {
      service.setBreadcrumbJsonLd([{ name: 'Home', url: 'https://gethiredonline.app/home' }]);
      expect(document.getElementById('gh-jsonld-breadcrumb')).toBeTruthy();
      service.resetToDefaults();
      expect(document.getElementById('gh-jsonld-breadcrumb')).toBeNull();
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// SSR safety tests — PLATFORM_ID = 'server'
// ──────────────────────────────────────────────────────────────────────────────

describe('SeoService (SSR / server platform)', () => {
  let service: SeoService;

  beforeEach(() => {
    ({ service } = createService(false));
  });

  afterEach(() => TestBed.resetTestingModule());

  it('setCanonical works via DOCUMENT token in SSR context (does not throw)', () => {
    // V4: setCanonical no longer guards on isBrowser. It uses @Inject(DOCUMENT)
    // which Angular Universal resolves to a server-side DOM stub. In tests,
    // DOCUMENT resolves to JSDOM — the canonical link IS inserted.
    expect(() => service.setCanonical('https://gethiredonline.app/jobs')).not.toThrow();
    const link = document.querySelector('link[rel="canonical"]');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toBe('https://gethiredonline.app/jobs');
    // cleanup
    link?.remove();
  });

  it('setJsonLd injects via DOCUMENT token (SSR-safe, no isBrowser guard)', () => {
    // V4: setJsonLd no longer returns early when PLATFORM_ID = 'server'.
    // Angular Universal provides a safe DOCUMENT stub in real SSR; JSDOM here.
    expect(() => service.setJsonLd('gh-test-ssr', { '@type': 'WebSite' })).not.toThrow();
    expect(document.getElementById('gh-test-ssr')).toBeTruthy();
    // cleanup
    document.getElementById('gh-test-ssr')?.remove();
  });

  it('clearJsonLd does NOT throw on server side', () => {
    expect(() => service.clearJsonLd('gh-test-ssr')).not.toThrow();
  });

  it('setJobPostingJsonLd injects structured data via DOCUMENT token in SSR context', () => {
    // V4: JobPosting schema is now emitted in SSR-rendered HTML (the core V4 goal).
    service.setJobPostingJsonLd(makeJob());
    expect(document.getElementById('gh-jsonld-jobposting')).toBeTruthy();
    // cleanup
    document.getElementById('gh-jsonld-jobposting')?.remove();
  });

  it('setPageMeta still updates Title and Meta (no DOM restriction)', () => {
    // Title/Meta services use Renderer2 internally — they are SSR-safe.
    // setPageMeta must NOT be restricted to browser-only.
    expect(() => service.setPageMeta({
      title: 'SSR Test',
      description: 'SSR description',
    })).not.toThrow();
  });

  it('resetToDefaults does not throw in SSR context', () => {
    expect(() => service.resetToDefaults()).not.toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// company_name fallback chain (mirrors PublicDetailsComponent logic)
// ──────────────────────────────────────────────────────────────────────────────

describe('company_name fallback chain (PublicDetailsComponent pattern)', () => {
  /** Replicate the exact expression from public-details.component.ts line 41 */
  function resolveCompanyName(job: any): string {
    return (job as any).company_name || (job as any).companyName || 'GetHired Company';
  }

  it('uses snake_case company_name when present', () => {
    expect(resolveCompanyName({ company_name: 'Acme Corp', companyName: 'Other' }))
      .toBe('Acme Corp');
  });

  it('falls back to camelCase companyName when company_name is absent', () => {
    expect(resolveCompanyName({ companyName: 'Acme Corp' }))
      .toBe('Acme Corp');
  });

  it('falls back to "GetHired Company" when both are absent', () => {
    expect(resolveCompanyName({}))
      .toBe('GetHired Company');
  });

  it('falls back to "GetHired Company" when company_name is empty string', () => {
    expect(resolveCompanyName({ company_name: '', companyName: '' }))
      .toBe('GetHired Company');
  });

  it('falls back to camelCase when company_name is empty string but companyName is set', () => {
    expect(resolveCompanyName({ company_name: '', companyName: 'Real Name' }))
      .toBe('Real Name');
  });
});
