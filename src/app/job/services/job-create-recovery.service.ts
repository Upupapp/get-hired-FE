import { Injectable } from '@angular/core';

/**
 * SESSION-SILENT-REFRESH (last-resort work protection, Job Create only):
 * a small, self-contained local recovery snapshot for the manual Job
 * Create/Edit wizard, so an involuntary session loss (silent refresh
 * failed, refresh token itself invalid/expired/revoked -- see
 * TokenLifecycleService/UnAuthorizedInterceptor) doesn't quietly discard
 * whatever the employer was mid-typing.
 *
 * Deliberately narrow scope for this pass: only job-create.component.ts
 * uses this. Not a general "recover any form on any page" mechanism, and
 * not the same thing as AiCreateDraftService (that's the AI-assisted
 * Create flow's own longer-lived, 7-day, multi-step recovery system this
 * mirrors the *pattern* of, not the storage).
 */
export interface JobCreateRecoveryEnvelope {
  ownerScope: string;
  jobId: string | null;
  formValue: any;
  savedAt: string;
  expiresAt: string;
}

@Injectable({ providedIn: 'root' })
export class JobCreateRecoveryService {
  private static readonly KEY_PREFIX = 'gethired.employer.jobCreateRecovery.v1.';
  // Short-lived on purpose -- this is a safety net for an interrupted
  // session, not a general draft-save feature (that's autosave itself).
  private static readonly TTL_MS = 24 * 60 * 60 * 1000;

  private keyFor(ownerScope: string): string {
    return JobCreateRecoveryService.KEY_PREFIX + encodeURIComponent(ownerScope);
  }

  save(ownerScope: string, jobId: string | null, formValue: any): void {
    if (!ownerScope || typeof localStorage === 'undefined') return;
    try {
      const now = new Date();
      const envelope: JobCreateRecoveryEnvelope = {
        ownerScope,
        jobId,
        formValue,
        savedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + JobCreateRecoveryService.TTL_MS).toISOString(),
      };
      localStorage.setItem(this.keyFor(ownerScope), JSON.stringify(envelope));
    } catch (_) { /* best-effort only -- never block the actual logout on this */ }
  }

  load(ownerScope: string): JobCreateRecoveryEnvelope | null {
    if (!ownerScope || typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(this.keyFor(ownerScope));
      if (!raw) return null;
      const envelope: JobCreateRecoveryEnvelope = JSON.parse(raw);
      if (!envelope || !envelope.expiresAt || new Date(envelope.expiresAt).getTime() < Date.now()) {
        this.clear(ownerScope);
        return null;
      }
      return envelope;
    } catch (_) {
      return null;
    }
  }

  clear(ownerScope: string): void {
    if (!ownerScope || typeof localStorage === 'undefined') return;
    try { localStorage.removeItem(this.keyFor(ownerScope)); } catch (_) {}
  }
}
