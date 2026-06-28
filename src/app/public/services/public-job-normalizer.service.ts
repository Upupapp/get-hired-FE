import { Injectable } from '@angular/core';
import { NormalizedBadge, NormalizedJob, NormalizedCertificationRequirement } from './public-job-normalizer.model';

/**
 * Converts raw /job/published and /job/details API responses into
 * NormalizedJob. Pure, stateless, defensive — never throws on missing or
 * inconsistently-typed fields. See PUBLIC_JOB_PORTAL_REDESIGN.md §1.6/§4 for
 * the documented field-availability reference this is built from.
 */
@Injectable({ providedIn: 'root' })
export class PublicJobNormalizerService {

  normalize(raw: any): NormalizedJob {
    if (!raw) {
      return this.empty();
    }

    const salaryMin = this.toNumber(raw.salaryMinimum ?? raw.salary_minimum);
    const salaryMax = this.toNumber(raw.salaryMaximum ?? raw.salary_maximum);
    const salaryCurrency = this.toStringOrNull(raw.salaryCurrency ?? raw.salary_currency);

    const interviewQuestions = this.toArray(raw.interviewQuestions ?? raw.interview_questions);
    const interviewTemplateId = raw.interviewTemplateId ?? raw.interview_template_id ?? null;

    const city = this.toStringOrNull(raw.jobCity ?? raw.job_city);
    const country = this.toStringOrNull(raw.jobCountry ?? raw.job_country);

    return {
      jobId: this.toStringOrNull(raw.jobId ?? raw.job_id) ?? '',
      title: this.toStringOrNull(raw.jobTitle ?? raw.job_title) ?? 'Untitled role',

      companyId: this.toStringOrNull(raw.companyId ?? raw.company_id) ?? '',
      companyName: this.toStringOrNull(raw.companyName ?? raw.company_name) ?? 'Company',
      companyLogo: this.toStringOrNull(raw.companyLogoUrl ?? raw.company_logo ?? raw.companyLogo),
      companyDetails: this.toStringOrNull(raw.companyDetails ?? raw.company_details),
      companyCity: this.toStringOrNull(raw.companyCity ?? raw.company_city),
      companyCountry: this.toStringOrNull(raw.companyCountry ?? raw.company_country),
      companyNumberOfEmployee: this.toStringOrNull(raw.numberOfEmployee ?? raw.number_of_employee),

      location: this.joinLocation(city, country),
      city,
      country,

      workSetupId: this.toNumberOrNull(raw.workSetupId ?? raw.work_setup_id),
      workSetup: this.toStringOrNull(raw.workSetupName ?? raw.work_setup_name),

      salaryMin,
      salaryMax,
      salaryCurrency,
      salaryDisplay: this.formatSalary(salaryMin, salaryMax, salaryCurrency),
      hasSalary: salaryMin != null || salaryMax != null,

      jobTypeId: this.toNumberOrNull(raw.jobTypeId ?? raw.job_type_id),
      jobType: this.toStringOrNull(raw.jobTypeName ?? raw.job_type_name),
      jobLevelId: this.toNumberOrNull(raw.jobLevelId ?? raw.job_level_id),
      jobLevel: this.toStringOrNull(raw.jobLevelName ?? raw.job_level_name),
      industryId: this.toNumberOrNull(raw.industryId ?? raw.industry_id),
      industry: this.toStringOrNull(raw.industryName ?? raw.industry_name),
      categoryId: this.toNumberOrNull(raw.jobCategoryId ?? raw.job_category_id),
      category: this.toStringOrNull(raw.jobCategoryName ?? raw.job_category_name),
      jobRoleId: this.toNumberOrNull(raw.jobRoleId ?? raw.job_role_id),
      jobRole: this.toStringOrNull(raw.jobRoleName ?? raw.job_role_name),

      statusId: this.toNumberOrNull(raw.jobStatusId ?? raw.job_status_id),

      postedDate: this.toDateOrNull(raw.createdAt ?? raw.created_at),
      expirationDate: this.toDateOrNull(raw.expirationDate ?? raw.expiration_date),

      description: this.toStringOrNull(raw.jobDescription ?? raw.job_description),
      responsibilities: this.toStringOrNull(raw.jobDuties ?? raw.job_duties),
      requirements: this.toStringArray(raw.requirements),
      skills: this.toStringArray(raw.skills),
      tags: this.toStringArray(raw.tags),
      goodToHave: this.toStringArray(raw.goodToHave),
      educationalBackground: this.toStringArray(raw.educationalBackground),
      // No benefits/perks field exists on the wire today — always empty
      // until backend adds one. See PUBLIC_JOB_PORTAL_BACKEND_OPTIONAL_CHANGES.md.
      benefits: [],
      certificationRequirements: this.toCertificationRequirements(raw.certificationRequirements),

      hasVideoInterview: interviewQuestions.length > 0 || !!interviewTemplateId,
      interviewQuestionCount: interviewQuestions.length,

      companyProfileAvailable: !!(raw.companyId ?? raw.company_id),
      badges: this.toBadges(raw.badges),

      applyStatus: raw.isApplied === true ? 'applied' : 'not_applied',
      savedStatus: raw.isSaved === true ? 'saved' : (raw.isSaved === false ? 'not_saved' : 'unknown'),
    };
  }

  normalizeList(rawList: any[]): NormalizedJob[] {
    if (!Array.isArray(rawList)) {
      return [];
    }
    return rawList.map(raw => this.normalize(raw));
  }

  // ── Defensive primitives ──────────────────────────────────────────────

  private empty(): NormalizedJob {
    return this.normalize({});
  }

  private toStringOrNull(value: any): string | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return String(value);
  }

  private toNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const n = typeof value === 'number' ? value : parseFloat(value);
    return Number.isFinite(n) ? n : null;
  }

  private toNumberOrNull(value: any): number | null {
    return this.toNumber(value);
  }

  private toDateOrNull(value: any): Date | null {
    if (!value) {
      return null;
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private toArray(value: any): any[] {
    return Array.isArray(value) ? value : [];
  }

  /**
   * Tags/skills/requirements arrive as string[] on the wire, but one of the
   * two existing FE model files (jobs.model.ts BasicJob) incorrectly types
   * tags as Options[]. Accept either shape defensively.
   */
  private toStringArray(value: any): string[] {
    const arr = this.toArray(value);
    return arr
      .map(item => (typeof item === 'string' ? item : item?.name))
      .filter((item): item is string => !!item);
  }

  private toBadges(value: any): NormalizedBadge[] {
    const arr = this.toArray(value);
    return arr
      .map((item): NormalizedBadge | null => {
        if (typeof item === 'string') {
          return { name: item };
        }
        if (item && typeof item === 'object' && item.name) {
          return { id: item.id, name: item.name, icon: item.icon };
        }
        return null;
      })
      .filter((b): b is NormalizedBadge => b !== null);
  }

  /** GETHIRED JOB CERTIFICATION REQUIREMENTS v1 -- defensive against
   * missing/malformed entries (e.g. jobs created before this feature
   * shipped, which simply have an empty array from the backend). */
  private toCertificationRequirements(value: any): NormalizedCertificationRequirement[] {
    const arr = this.toArray(value);
    return arr
      .map((item): NormalizedCertificationRequirement | null => {
        if (!item || typeof item !== 'object' || !item.name) {
          return null;
        }
        return {
          id: item.id,
          name: item.name,
          type: item.type ?? 'certification',
          importance: item.importance ?? 'required',
          issuingAuthority: item.issuingAuthority ?? null,
          expiryRequired: !!item.expiryRequired,
          verificationRequired: !!item.verificationRequired,
        };
      })
      .filter((c): c is NormalizedCertificationRequirement => c !== null);
  }

  private joinLocation(city: string | null, country: string | null): string | null {
    if (city && country) return `${city}, ${country}`;
    return city ?? country ?? null;
  }

  private formatSalary(min: number | null, max: number | null, currency: string | null): string {
    if (min == null && max == null) {
      return 'Salary not listed';
    }
    const cur = currency ?? '';
    const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (min != null && max != null && min !== max) {
      return `${cur} ${fmt(min)} - ${fmt(max)}`.trim();
    }
    const single = min ?? max ?? 0;
    return `${cur} ${fmt(single)}`.trim();
  }
}
