import { Injectable } from '@angular/core';
import { GenerateIntentInputs, InstantJobDraft } from '../easy-job-post-assistant/easy-job-post-assistant.models';

/**
 * GETHIRED_EMPLOYER_AI_CREATE_PERSISTENT_UNFINISHED_JOB_DRAFT_FLOW_SINGLE_COMMAND_V2
 *
 * Canonical, sole storage for unfinished Employer "AI Create" job intent
 * (EasyJobPostAssistantModalComponent's Generate step). Supersedes
 * GuestJobDraftService ("Start From Scratch" restore) -- that behavior is
 * removed; From Scratch is now always a clean manual form. This service is
 * the single place both the pre-registration guest entry point
 * (AiJobPreviewPanelComponent) and the authenticated AI Create panel read
 * from and write to, so there is exactly one persistent unfinished-job
 * workspace, not several competing ones.
 *
 * Storage contract:
 *   key: gethired.employer.aiCreateDraft.v1
 *   TTL: 7 days
 *   ownerScope: 'guest' before authentication, the authenticated user's
 *     stable _id after (see adoptGuestDraftForUser()) -- frontend-only
 *     isolation so one browser used by two different Employers never
 *     silently mixes their drafts. Never trusted for backend authorization;
 *     job ownership always comes from the authenticated server-side
 *     company context, never from anything stored here.
 *   Never stores credentials, tokens, or verification codes.
 */

export type AiCreateDraftStatus =
  | 'pending-registration'
  | 'editing'
  | 'generated'
  | 'posting';

export interface AiCreateDraftEnvelope {
  schemaVersion: number;
  draftId: string;
  intent: 'employer-ai-create-job';
  ownerScope: string; // 'guest' or an authenticated user's stable _id
  source: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  status: AiCreateDraftStatus;
  input: GenerateIntentInputs;
  generated?: InstantJobDraft | null;
}

// Exported so CoreService.logout() can preserve this key across its
// localStorage.clear() call -- a real session-expiry logout must not
// destroy a pending AI Create draft.
export const AI_CREATE_DRAFT_STORAGE_KEY = 'gethired.employer.aiCreateDraft.v1';
const STORAGE_KEY = AI_CREATE_DRAFT_STORAGE_KEY;
// Superseded key -- see migrateLegacyDraftIfPresent(). Kept as a literal
// (not imported from the now-unused GuestJobDraftService) so this service
// has no dependency on the code path it's replacing.
const LEGACY_STORAGE_KEY = 'gethired.employer.jobDraft.v1';
const SCHEMA_VERSION = 1;
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const GUEST_OWNER_SCOPE = 'guest';

@Injectable({ providedIn: 'root' })
export class AiCreateDraftService {

  /** Persists/overwrites the draft for the given owner scope. This product
   *  supports exactly one active AI Create draft at a time (Phase 32). */
  save(input: GenerateIntentInputs, ownerScope: string, source: string, status: AiCreateDraftStatus = 'editing', generated?: InstantJobDraft | null): boolean {
    const now = new Date();
    const existing = this.readRaw();
    const envelope: AiCreateDraftEnvelope = {
      schemaVersion: SCHEMA_VERSION,
      draftId: (existing && existing.ownerScope === ownerScope) ? existing.draftId : this.generateId(),
      intent: 'employer-ai-create-job',
      ownerScope,
      source,
      createdAt: (existing && existing.ownerScope === ownerScope) ? existing.createdAt : now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + TTL_MS).toISOString(),
      status,
      input,
      generated: generated !== undefined ? generated : (existing && existing.ownerScope === ownerScope ? existing.generated : null),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
      // Verify the write actually landed (Phase 34: don't claim saved when
      // persistence failed -- e.g. quota exceeded can silently no-op in
      // some browsers/modes).
      return localStorage.getItem(STORAGE_KEY) === JSON.stringify(envelope);
    } catch (_) {
      return false;
    }
  }

  /** Returns the draft only if it belongs to the given owner scope, is
   *  structurally valid, the right schema version, and not expired.
   *  Returns null (never throws) for anything else, including a draft that
   *  genuinely exists but belongs to a DIFFERENT owner scope -- that draft
   *  is left untouched in storage, just not surfaced to this caller
   *  (Phase 16-18 cross-account isolation). */
  load(ownerScope: string): AiCreateDraftEnvelope | null {
    const envelope = this.readRaw();
    if (!envelope) return null;
    if (envelope.ownerScope !== ownerScope) return null;
    return envelope;
  }

  hasPending(ownerScope: string): boolean {
    return this.load(ownerScope) !== null;
  }

  /** Clear only after confirmed successful job persistence, or an explicit
   *  user discard -- never merely because a page loaded, a mode was
   *  switched, or generation succeeded. Only clears if the stored draft
   *  actually belongs to the given owner scope, so a stray call can't wipe
   *  a different Employer's draft. */
  clear(ownerScope: string): void {
    const envelope = this.readRaw();
    if (envelope && envelope.ownerScope === ownerScope) {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    }
  }

  /** Once a guest completes registration/verification and reaches an
   *  authenticated Employer context, adopt their pre-auth draft (still
   *  scoped to GUEST_OWNER_SCOPE) into the newly authenticated uid's scope.
   *  No-op if there's no pending guest draft, or if the current owner scope
   *  already has its own draft (never overwrite an existing authenticated
   *  draft with a guest one). */
  adoptGuestDraftForUser(authenticatedOwnerScope: string): void {
    if (!authenticatedOwnerScope || authenticatedOwnerScope === GUEST_OWNER_SCOPE) return;
    const guestDraft = this.load(GUEST_OWNER_SCOPE);
    if (!guestDraft) return;
    if (this.hasPending(authenticatedOwnerScope)) return; // never clobber

    const adopted: AiCreateDraftEnvelope = { ...guestDraft, ownerScope: authenticatedOwnerScope, updatedAt: new Date().toISOString() };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(adopted)); } catch (_) {}
  }

  /** One-time safe migration from the superseded GuestJobDraftService key
   *  (used by the old "restore into Start From Scratch" behavior) into the
   *  new AI Create draft model. Never removes the old key before a
   *  successful, verified write of the new one. Safe to call unconditionally
   *  on load -- no-ops if there's nothing to migrate or it's already expired/
   *  malformed. The migrated draft targets the given owner scope (GUEST_
   *  OWNER_SCOPE if called before authentication is known). */
  migrateLegacyDraftIfPresent(ownerScope: string): void {
    let raw: string | null;
    try { raw = localStorage.getItem(LEGACY_STORAGE_KEY); } catch (_) { return; }
    if (!raw) return;

    let legacy: any;
    try { legacy = JSON.parse(raw); } catch (_) {
      try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch (_) {}
      return;
    }

    const expiresAt = legacy && Date.parse(legacy.expiresAt);
    const validShape = legacy && legacy.payload && typeof legacy.payload === 'object';
    if (!validShape || !expiresAt || Date.now() > expiresAt) {
      // Malformed or expired -- do not migrate; just drop the stale key.
      try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch (_) {}
      return;
    }

    // Don't clobber an already-existing AI Create draft for this scope.
    if (this.hasPending(ownerScope)) {
      try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch (_) {}
      return;
    }

    const input: GenerateIntentInputs = {
      jobTitle: legacy.payload.jobTitle || '',
      location: legacy.payload.jobCity || '',
      workSetup: '', // legacy payload stored workSetupId (a number), not the
                     // AI Create panel's string enum -- no safe conversion
                     // without the id->label map used elsewhere; left blank
                     // rather than guessing.
      employmentType: '',
      industry: '',
    };
    if (!input.jobTitle) {
      // Nothing meaningful to migrate.
      try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch (_) {}
      return;
    }

    const wrote = this.save(input, ownerScope, 'legacy-migration');
    if (wrote) {
      try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch (_) {}
    }
    // If the write failed, deliberately leave the legacy key in place --
    // never lose data by removing the old copy before the new one is
    // confirmed to exist.
  }

  private readRaw(): AiCreateDraftEnvelope | null {
    let raw: string | null;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
    if (!raw) return null;

    let parsed: any;
    try { parsed = JSON.parse(raw); } catch (_) {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      return null;
    }

    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
    if (parsed.intent !== 'employer-ai-create-job') return null;
    if (!parsed.input || typeof parsed.input !== 'object') return null;

    const expiresAt = Date.parse(parsed.expiresAt);
    if (!expiresAt || Date.now() > expiresAt) {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      return null;
    }

    return parsed as AiCreateDraftEnvelope;
  }

  private generateId(): string {
    return 'aicd_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
  }
}
