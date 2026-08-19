import { Injectable } from '@angular/core';

/**
 * GETHIRED_UNIFIED_FE_UIUX_CONTINUATION_AND_EMPLOYER_JOB_POST_FLOW_REFINEMENT_COMMAND_V1
 *
 * Persists a first-time guest's unfinished "Create a Job / From Scratch"
 * intent across registration -> local email verification -> signin, so they
 * never have to retype it. Deliberately client-side/localStorage (not the
 * server-side AI-preview claim-token system, which stays as-is for the
 * preview-generation feature) -- this covers the case where the frontend
 * recognizes a guest BEFORE attempting anything auth-dependent and skips
 * calling the backend entirely, so there's no server-side token to claim.
 *
 * Storage contract:
 *   key: gethired.employer.jobDraft.v1 (versioned, product-namespaced)
 *   TTL: 7 days (job-post intent, not a short-lived preview -- the employer
 *        may take real time to get through registration + email verification)
 *   Never stores credentials, tokens, or verification codes -- payload is
 *   restricted to the same canonical job-form fields the authenticated
 *   "Create a Job / From Scratch" form (JobCreateComponent) already collects.
 */

export interface GuestJobDraftEnvelope {
  schemaVersion: number;
  draftId: string;
  intent: 'employer-create-job-from-scratch';
  source: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  status: 'pending-registration';
  payload: Record<string, any>;
}

// Exported so CoreService.logout() can preserve this one key across its
// localStorage.clear() call -- a real session-expiry logout must not
// destroy a pending guest job draft (see ai-job-preview-panel.component.ts).
export const GUEST_JOB_DRAFT_STORAGE_KEY = 'gethired.employer.jobDraft.v1';
const STORAGE_KEY = GUEST_JOB_DRAFT_STORAGE_KEY;
const SCHEMA_VERSION = 1;
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Injectable({ providedIn: 'root' })
export class GuestJobDraftService {

  /** Persists a new pending draft. Overwrites any existing one -- this
   *  product supports exactly one active pending guest job draft. */
  save(payload: Record<string, any>, source: string): void {
    const now = new Date();
    const envelope: GuestJobDraftEnvelope = {
      schemaVersion: SCHEMA_VERSION,
      draftId: this.generateId(),
      intent: 'employer-create-job-from-scratch',
      source,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + TTL_MS).toISOString(),
      status: 'pending-registration',
      payload,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    } catch (_) {
      // localStorage unavailable (private browsing, quota, etc.) -- the
      // guest simply won't get draft continuity; never throw over this.
    }
  }

  /** Returns the pending draft only if it's structurally valid, the right
   *  schema version, the right intent, and not expired. Never throws on
   *  malformed/corrupt storage content. */
  load(): GuestJobDraftEnvelope | null {
    let raw: string | null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return null;
    }
    if (!raw) return null;

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (_) {
      this.clear();
      return null;
    }

    if (!parsed || typeof parsed !== 'object') { this.clear(); return null; }
    if (parsed.schemaVersion !== SCHEMA_VERSION) { this.clear(); return null; }
    if (parsed.intent !== 'employer-create-job-from-scratch') { this.clear(); return null; }
    if (!parsed.payload || typeof parsed.payload !== 'object') { this.clear(); return null; }

    const expiresAt = Date.parse(parsed.expiresAt);
    if (!expiresAt || Date.now() > expiresAt) { this.clear(); return null; }

    return parsed as GuestJobDraftEnvelope;
  }

  hasPending(): boolean {
    return this.load() !== null;
  }

  /** Clear only after confirmed successful job persistence, or an explicit
   *  user discard -- never merely because a page loaded or a route changed. */
  clear(): void {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }

  private generateId(): string {
    return 'gjd_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
  }
}
