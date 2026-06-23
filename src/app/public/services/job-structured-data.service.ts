import { Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';
import { NormalizedJob } from './public-job-normalizer.model';

/**
 * Injects schema.org JobPosting JSON-LD for the public job detail page
 * (GH-ACT step 17 -- SEO structured data). No SEO/meta-tag/structured-data
 * code existed anywhere in this codebase before this (confirmed via
 * repo-wide search) -- this is a net-new, additive capability.
 *
 * Every field below maps to a real, confirmed field from
 * PUBLIC_JOB_PORTAL_REDESIGN.md §4's field-availability reference. Fields
 * the backend doesn't actually provide (view/application counts,
 * featured/urgent flags, "actively reviewing") are never fabricated here,
 * consistent with the mission's anti-fake-data rule -- Google's structured
 * data guidelines also penalize job postings with mismatched/fake content.
 */
@Injectable({ providedIn: 'root' })
export class JobStructuredDataService {
  private readonly scriptId = 'job-posting-structured-data';

  constructor(@Inject(DOCUMENT) private document: Document) {}

  apply(job: NormalizedJob): void {
    if (!job || !job.jobId) {
      this.remove();
      return;
    }

    const schema = this.buildSchema(job);
    let script = this.document.getElementById(this.scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = this.document.createElement('script');
      script.id = this.scriptId;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }

    script.text = JSON.stringify(schema);
  }

  remove(): void {
    const script = this.document.getElementById(this.scriptId);
    if (script) {
      script.remove();
    }
  }

  private buildSchema(job: NormalizedJob): Record<string, unknown> {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: job.title,
      // Description is required by schema.org -- fall back to the title
      // rather than omitting the field if the job genuinely has no
      // description text yet.
      description: job.description || job.title,
      hiringOrganization: {
        '@type': 'Organization',
        name: job.companyName,
        ...(job.companyLogo ? { logo: job.companyLogo } : {}),
      },
    };

    if (job.postedDate) {
      schema['datePosted'] = job.postedDate.toISOString();
    }
    if (job.expirationDate) {
      schema['validThrough'] = job.expirationDate.toISOString();
    }

    const employmentType = this.toEmploymentType(job.jobType);
    if (employmentType) {
      schema['employmentType'] = employmentType;
    }

    if (job.workSetup?.toLowerCase() === 'remote') {
      schema['jobLocationType'] = 'TELECOMMUTE';
      if (job.country) {
        schema['applicantLocationRequirements'] = {
          '@type': 'Country',
          name: job.country,
        };
      }
    } else if (job.city || job.country) {
      schema['jobLocation'] = {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          ...(job.city ? { addressLocality: job.city } : {}),
          ...(job.country ? { addressCountry: job.country } : {}),
        },
      };
    }

    // No pay-period (monthly/hourly/annual) field exists anywhere in the
    // data model -- omitting `unitText` rather than guessing one, since an
    // incorrect assumption here would misrepresent real compensation.
    if (job.hasSalary && job.salaryCurrency) {
      schema['baseSalary'] = {
        '@type': 'MonetaryAmount',
        currency: job.salaryCurrency,
        value: {
          '@type': 'QuantitativeValue',
          ...(job.salaryMin != null ? { minValue: job.salaryMin } : {}),
          ...(job.salaryMax != null ? { maxValue: job.salaryMax } : {}),
        },
      };
    }

    return schema;
  }

  private toEmploymentType(jobType: string | null): string | null {
    switch ((jobType ?? '').toLowerCase()) {
      case 'full time':
        return 'FULL_TIME';
      case 'part time':
        return 'PART_TIME';
      case 'contractor':
        return 'CONTRACTOR';
      default:
        return null;
    }
  }
}
