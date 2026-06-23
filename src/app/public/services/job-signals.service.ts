import { Injectable } from '@angular/core';
import { NormalizedJob } from './public-job-normalizer.model';
import { JobSignalBadge, JobSignals } from './job-signals.model';

/**
 * Real-data-only trust/freshness signals for a job. See
 * PUBLIC_JOB_PORTAL_REDESIGN.md Phase 7 rules: never fabricate urgency,
 * activity, or "actively reviewing" — those fields don't exist on the
 * backend today, so they are intentionally absent here, not stubbed with
 * fake values. Adding them later just means adding a new badge case once
 * the backend field exists (see PUBLIC_JOB_PORTAL_BACKEND_OPTIONAL_CHANGES.md).
 *
 * job_status_id convention (inferred from existing backend switch-statement
 * logic in jobsController.js::getBasicJobList, no authoritative lookup table
 * exists — see redesign doc §1.10): 1=Draft, 2=Published, 3=Expired, 4=Archived.
 */
const STATUS_PUBLISHED = 2;
const STATUS_EXPIRED = 3;
const STATUS_ARCHIVED = 4;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class JobSignalsService {

  compute(job: NormalizedJob, now: Date = new Date()): JobSignals {
    const expiredByDate = !!job.expirationDate && job.expirationDate.getTime() < now.getTime();
    const expiredByStatus = job.statusId === STATUS_EXPIRED;
    const isExpired = expiredByDate || expiredByStatus;
    const isClosed = isExpired || job.statusId === STATUS_ARCHIVED;
    const isActive = !isClosed && (job.statusId == null || job.statusId === STATUS_PUBLISHED);

    const primaryBadges: JobSignalBadge[] = [];
    const secondaryBadges: JobSignalBadge[] = [];
    const trustIndicators: string[] = [];
    const warnings: string[] = [];

    if (!isClosed) {
      this.workSetupBadge(job, primaryBadges);
      this.freshnessBadge(job, now, primaryBadges);
      this.closingSoonBadge(job, now, primaryBadges);

      if (job.hasVideoInterview) {
        secondaryBadges.push({ id: 'video-interview', label: 'Video interview' });
      }
      if (job.hasSalary) {
        secondaryBadges.push({ id: 'salary-shown', label: 'Salary shown' });
        trustIndicators.push('Salary shown');
      }
      if (job.companyProfileAvailable) {
        secondaryBadges.push({ id: 'company-profile', label: 'Company profile available' });
        trustIndicators.push('Company profile available');
      }
      if (job.requirements.length > 0) {
        trustIndicators.push('Clear requirements');
      }
      if (job.workSetup) {
        trustIndicators.push('Work setup specified');
      }
    }

    if (isExpired || isClosed) {
      warnings.push('This job is no longer accepting applications.');
    }
    if (!job.companyProfileAvailable) {
      warnings.push('Company profile unavailable for this listing.');
    }

    return {
      primaryBadges,
      secondaryBadges,
      freshnessLabel: this.freshnessLabel(job, now),
      trustIndicators,
      warnings,
      isExpired,
      isClosed,
      isActive,
      displayPriority: this.displayPriority(job, isActive, now),
    };
  }

  computeList(jobs: NormalizedJob[], now: Date = new Date()): Map<string, JobSignals> {
    const map = new Map<string, JobSignals>();
    for (const job of jobs) {
      map.set(job.jobId, this.compute(job, now));
    }
    return map;
  }

  // ── Individual signal builders ───────────────────────────────────────

  private workSetupBadge(job: NormalizedJob, out: JobSignalBadge[]): void {
    const setup = job.workSetup?.toLowerCase();
    if (!setup) return;
    if (setup.includes('remote')) out.push({ id: 'remote', label: 'Remote' });
    else if (setup.includes('hybrid')) out.push({ id: 'hybrid', label: 'Hybrid' });
    else if (setup.includes('onsite') || setup.includes('on-site')) out.push({ id: 'onsite', label: 'Onsite' });
  }

  private freshnessBadge(job: NormalizedJob, now: Date, out: JobSignalBadge[]): void {
    if (!job.postedDate) return;
    const ageMs = now.getTime() - job.postedDate.getTime();
    if (ageMs < 0) return; // clock skew / future date — don't claim freshness we can't verify
    if (ageMs <= ONE_DAY_MS) {
      out.push({ id: 'posted-today', label: 'Posted today' });
    } else if (ageMs <= 7 * ONE_DAY_MS) {
      out.push({ id: 'posted-this-week', label: 'Posted this week' });
    }
  }

  private closingSoonBadge(job: NormalizedJob, now: Date, out: JobSignalBadge[]): void {
    if (!job.expirationDate) return; // never fabricate a deadline that doesn't exist
    const remainingMs = job.expirationDate.getTime() - now.getTime();
    if (remainingMs > 0 && remainingMs <= 3 * ONE_DAY_MS) {
      out.push({ id: 'closing-soon', label: 'Closing soon' });
    }
  }

  private freshnessLabel(job: NormalizedJob, now: Date): string | null {
    if (!job.postedDate) return null;
    const ageMs = now.getTime() - job.postedDate.getTime();
    if (ageMs < 0) return null;
    const days = Math.floor(ageMs / ONE_DAY_MS);
    if (days <= 0) return 'Posted today';
    if (days === 1) return 'Posted 1 day ago';
    if (days <= 7) return `Posted ${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks <= 4) return `Posted ${weeks} week${weeks > 1 ? 's' : ''} ago`;
    return 'Posted a while ago';
  }

  private displayPriority(job: NormalizedJob, isActive: boolean, now: Date): number {
    if (!isActive) return -1;
    let score = 0;
    if (job.hasSalary) score += 1;
    if (job.hasVideoInterview) score += 1;
    if (job.companyProfileAvailable) score += 1;
    if (job.postedDate) {
      const ageMs = now.getTime() - job.postedDate.getTime();
      if (ageMs >= 0 && ageMs <= 7 * ONE_DAY_MS) score += 1;
    }
    return score;
  }
}
