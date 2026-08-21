import { Injectable } from '@angular/core';
import { GenerateIntentInputs, InstantJobDraft } from '../easy-job-post-assistant/easy-job-post-assistant.models';

/**
 * GETHIRED_EMPLOYER_AI_CREATE_RECOVERY_SERVER_DRAFT_GUEST_SPAM_SIGNOUT_SAFETY_MASTER_COMMAND_V1
 * (supersedes the V2 single-command version's v1 storage model)
 *
 * Canonical, sole storage for unfinished Employer "AI Create" job intent
 * (EasyJobPostAssistantModalComponent's Generate step and the pre-auth
 * public entry point, AiJobPreviewPanelComponent). This is LOCAL AI RECOVERY
 * only -- a browser working copy for continuity/autosave, never treated as
 * proof of identity or company ownership, and never a substitute for the
 * canonical server-side Save-as-Draft job record (job_status_id = 1,
 * JobCreateComponent.saveAsDraft()).
 *
 * Storage contract (v2 -- owner-isolated keys, TAB 06):
 *   key: gethired.employer.aiCreateDraft.v2.<encoded ownerScope>
 *   TTL: 7 days
 *   ownerScope: 'guest:<journeyId>' before authentication (see
 *     getOrCreateGuestOwnerScope() -- TAB 08, no shared global guest bucket),
 *     the authenticated user's stable _id after (see
 *     adoptGuestDraftForUser()). Each owner scope has its OWN storage key,
 *     so writing one owner's draft can never overwrite a different owner's
 *     -- the v1 model kept every owner in a single shared key and depended
 *     entirely on read-side checks, which is exactly the class of bug this
 *     replaces (a write from any scope could silently clobber any other).
 *   Never trusted for backend authorization; job ownership always comes
 *   from the authenticated server-side company context, never from
 *   anything stored here.
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
  ownerScope: string; // 'guest:<journeyId>' or an authenticated user's stable _id
  source: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  status: AiCreateDraftStatus;
  input: GenerateIntentInputs;
  generated?: InstantJobDraft | null;
  // TAB 15/17 -- server Draft synchronization. Set once the first explicit
  // Save Draft succeeds (JobCreateComponent.afterSubmit()). NOT set merely
  // because a background autosave ran -- this specifically marks a
  // confirmed server-side write, distinct from local recovery success.
  serverJobId?: string | null;
  // Local timestamp of the last confirmed server sync for this draft. The
  // current backend job-update endpoint does not maintain a real
  // updated_at/revision on save (see get-hired-BE/notes.md) -- there is no
  // server-provided freshness signal to compare against. This is therefore
  // a purely local, honest signal: "has THIS browser's own copy of the
  // draft changed since it last confirmed a server write," not "has the
  // server draft changed by some other actor." See hasUnsyncedLocalEdits().
  serverSyncedAt?: string | null;
}

const KEY_PREFIX = 'gethired.employer.aiCreateDraft.v2.';
// Superseded single-slot key from the prior session's v1 model -- see
// migrateLegacyDraftIfPresent(). Only ever existed locally this session.
const LEGACY_V1_KEY = 'gethired.employer.aiCreateDraft.v1';
// Superseded key from the GuestJobDraftService this replaced originally.
const LEGACY_JOBDRAFT_KEY = 'gethired.employer.jobDraft.v1';
// Small, non-payload pointer: which guest journey is currently active on
// this browser, so repeated guest-panel visits continue ONE journey instead
// of fragmenting into unrelated per-visit drafts (TAB 08).
const GUEST_JOURNEY_POINTER_KEY = 'gethired.employer.aiCreateGuestJourney.v1';
// Small, non-payload, one-shot pointer written immediately before a guest
// is sent to Register, naming the exact guest journey that registration
// originated from. adoptGuestDraftForUser() only adopts a guest draft that
// matches this pointer -- never an unrelated older guest draft that merely
// happens to still exist on the same device (TAB 09).
const RESUME_INTENT_KEY = 'gethired.employer.aiCreateResumeIntent.v1';
const SCHEMA_VERSION = 2;
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const GUEST_OWNER_SCOPE_PREFIX = 'guest:';

@Injectable({ providedIn: 'root' })
export class AiCreateDraftService {

  isGuestScope(ownerScope: string | null | undefined): boolean {
    return !!ownerScope && ownerScope.indexOf(GUEST_OWNER_SCOPE_PREFIX) === 0;
  }

  /** Returns this browser's current guest journey owner scope, creating and
   *  persisting a new journey id the first time this is called with no
   *  existing pointer. Repeated calls within the same unauthenticated
   *  browsing session return the SAME scope (TAB 08) -- multiple guest-panel
   *  interactions/page loads continue one journey rather than each becoming
   *  an unrelated draft. */
  getOrCreateGuestOwnerScope(): string {
    let raw: string | null;
    try { raw = localStorage.getItem(GUEST_JOURNEY_POINTER_KEY); } catch (_) { raw = null; }
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.journeyId === 'string' && parsed.journeyId) {
          return GUEST_OWNER_SCOPE_PREFIX + parsed.journeyId;
        }
      } catch (_) { /* malformed pointer -- fall through and create a fresh one */ }
    }
    const journeyId = this.generateId();
    try {
      localStorage.setItem(GUEST_JOURNEY_POINTER_KEY, JSON.stringify({ journeyId, createdAt: new Date().toISOString() }));
    } catch (_) { /* best-effort -- caller still gets a usable scope for this call */ }
    return GUEST_OWNER_SCOPE_PREFIX + journeyId;
  }

  /** Call once, right before navigating a guest into Register, to bind this
   *  exact guest journey as the one eligible for adoption once the account
   *  becomes authenticated (TAB 09). */
  markResumeIntent(guestOwnerScope: string): void {
    if (!this.isGuestScope(guestOwnerScope)) return;
    try {
      localStorage.setItem(RESUME_INTENT_KEY, JSON.stringify({ ownerScope: guestOwnerScope, createdAt: new Date().toISOString() }));
    } catch (_) {}
  }

  /** Persists/overwrites the draft for the given owner scope, at that
   *  owner's own isolated key. This product supports exactly one active AI
   *  Create draft per owner at a time (unchanged product decision) -- but
   *  unlike v1, that is now enforced by there being one key PER owner, not
   *  one key for everyone. */
  save(input: GenerateIntentInputs, ownerScope: string, source: string, status: AiCreateDraftStatus = 'editing', generated?: InstantJobDraft | null): boolean {
    const key = this.keyFor(ownerScope);
    const now = new Date();
    const existing = this.readRawAt(key);
    const envelope: AiCreateDraftEnvelope = {
      schemaVersion: SCHEMA_VERSION,
      draftId: existing ? existing.draftId : this.generateId(),
      intent: 'employer-ai-create-job',
      ownerScope,
      source,
      createdAt: existing ? existing.createdAt : now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + TTL_MS).toISOString(),
      status,
      input,
      generated: generated !== undefined ? generated : (existing ? existing.generated : null),
    };
    try {
      localStorage.setItem(key, JSON.stringify(envelope));
      // Verify the write actually landed -- don't claim saved when
      // persistence failed (e.g. quota exceeded can silently no-op in some
      // browsers/modes).
      return localStorage.getItem(key) === JSON.stringify(envelope);
    } catch (_) {
      return false;
    }
  }

  /** Returns the draft for the given owner scope's own isolated key, if
   *  structurally valid, the right schema version, and not expired. Returns
   *  null (never throws) otherwise. Cannot see another owner's draft --
   *  there is no shared key left to read cross-scope. */
  load(ownerScope: string): AiCreateDraftEnvelope | null {
    return this.readRawAt(this.keyFor(ownerScope));
  }

  hasPending(ownerScope: string): boolean {
    return this.load(ownerScope) !== null;
  }

  /** Clear only after confirmed successful job persistence, or an explicit
   *  user discard -- never merely because a page loaded, a mode was
   *  switched, or generation succeeded. Only ever touches the given owner
   *  scope's own key. */
  clear(ownerScope: string): void {
    try { localStorage.removeItem(this.keyFor(ownerScope)); } catch (_) {}
  }

  /** The exact localStorage key an owner scope's draft lives at -- exported
   *  so CoreService.logout() can preserve precisely the signed-out user's
   *  own draft across its localStorage.clear() call, without needing (or
   *  risking) a single shared key name. Also used by callers (the AI Create
   *  panel) to identify `storage` events for cross-tab conflict detection
   *  (TAB 18). */
  getStorageKeyFor(ownerScope: string): string {
    return this.keyFor(ownerScope);
  }

  /** TAB 15/16: call once a Save Draft (job_status_id = 1) succeeds, to
   *  associate the local recovery with the authoritative server job id
   *  instead of deleting the recovery -- Save Draft is a synchronization
   *  event, not a posting event (only a real Post should clear local
   *  recovery, see JobCreateComponent.afterSubmit()). This is also what
   *  makes repeated Save Draft calls update the same server record instead
   *  of creating duplicates possible in the first place: the caller is
   *  expected to retain `serverJobId` itself (JobCreateComponent already
   *  does, in `this.jobId`) and pass it back into `formatJob()` on
   *  subsequent saves. Purely a metadata stamp -- does not touch
   *  input/generated/status. No-op (false) if there's no draft to stamp. */
  markServerSynced(ownerScope: string, serverJobId: string): boolean {
    const key = this.keyFor(ownerScope);
    const existing = this.readRawAt(key);
    if (!existing || !serverJobId) return false;
    const envelope: AiCreateDraftEnvelope = {
      ...existing,
      serverJobId,
      serverSyncedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(key, JSON.stringify(envelope));
      return localStorage.getItem(key) === JSON.stringify(envelope);
    } catch (_) {
      return false;
    }
  }

  /** TAB 17: true if the local draft has been edited (autosaved) since the
   *  last confirmed server sync -- i.e. genuine unsaved local work that a
   *  reload/resume must not silently discard. This is the only staleness
   *  signal honestly computable today: the backend does not maintain a
   *  real updated_at/revision on job updates (see get-hired-BE/notes.md),
   *  so this can detect "I have edits the server doesn't have yet" but
   *  cannot detect "someone/something else changed the server draft since
   *  I last saved." False (nothing unsaved) if there's no draft, or it was
   *  never synced. */
  hasUnsyncedLocalEdits(ownerScope: string): boolean {
    const envelope = this.load(ownerScope);
    if (!envelope || !envelope.serverSyncedAt) return false;
    return Date.parse(envelope.updatedAt) > Date.parse(envelope.serverSyncedAt);
  }

  /** Once a guest completes registration/verification and reaches an
   *  authenticated Employer context, adopt their pre-auth draft -- but ONLY
   *  the exact guest journey this registration actually originated from
   *  (via the one-shot resume-intent pointer set by markResumeIntent()),
   *  never merely whatever guest draft happens to still exist on this
   *  browser (TAB 09). No-op if there's no matching resume intent, no
   *  matching guest draft, or the current owner scope already has its own
   *  draft (never overwrite an existing authenticated draft with a guest
   *  one). Write-new -> verify -> remove-old, never the reverse. */
  adoptGuestDraftForUser(authenticatedOwnerScope: string): void {
    if (!authenticatedOwnerScope || this.isGuestScope(authenticatedOwnerScope)) return;
    if (this.hasPending(authenticatedOwnerScope)) return; // never clobber -- see detectReconciliation() for that case

    const peek = this.peekValidResumeIntent();
    this.consumeResumeIntent(); // one-shot regardless of outcome below
    if (!peek) return;

    this.writeAdoptedDraft(authenticatedOwnerScope, peek);
  }

  /** RECONCILIATION -- non-destructive peek: is there BOTH an existing
   *  authenticated recovery for this owner AND a currently-valid, still-
   *  resumable guest journey? Pure read, safe to call repeatedly (e.g. on
   *  every panel mount) with no side effects -- actual resolution only
   *  happens via one of the resolveReconciliation*() methods below, driven
   *  by an explicit user choice, never automatically. */
  detectReconciliation(authenticatedOwnerScope: string): { employerDraft: AiCreateDraftEnvelope; guestDraft: AiCreateDraftEnvelope; guestOwnerScope: string } | null {
    if (!authenticatedOwnerScope || this.isGuestScope(authenticatedOwnerScope)) return null;
    const employerDraft = this.load(authenticatedOwnerScope);
    if (!employerDraft) return null;
    const peek = this.peekValidResumeIntent();
    if (!peek) return null;
    return { employerDraft, guestDraft: peek.guestDraft, guestOwnerScope: peek.guestOwnerScope };
  }

  /** "Continue Existing": the authenticated recovery is kept exactly as-is
   *  -- untouched, never rewritten. The dangling guest recovery and its
   *  resume intent are resolved (discarded) so this collision isn't
   *  detected again on the next page load. */
  resolveReconciliationContinueExisting(authenticatedOwnerScope: string): void {
    const peek = this.peekValidResumeIntent();
    this.consumeResumeIntent();
    if (!peek) return;
    try { localStorage.removeItem(this.keyFor(peek.guestOwnerScope)); } catch (_) {}
    try { localStorage.removeItem(GUEST_JOURNEY_POINTER_KEY); } catch (_) {}
  }

  /** "Use New Job": the guest job explicitly replaces the authenticated
   *  recovery. Write-new -> verify -> remove-old, same discipline as
   *  adoptGuestDraftForUser() -- this just skips its "never clobber" guard
   *  since overwriting IS the confirmed decision here. Never deletes
   *  either copy before the new write is verified to have landed. */
  resolveReconciliationUseNewJob(authenticatedOwnerScope: string): void {
    const peek = this.peekValidResumeIntent();
    this.consumeResumeIntent();
    if (!peek) return;
    this.writeAdoptedDraft(authenticatedOwnerScope, peek);
  }

  /** "Cancel": literally does nothing -- neither recovery is touched, the
   *  resume intent is left in place, so the same collision is detected
   *  again next time (no silent choice, no data loss). Exists only for
   *  documentation/symmetry; callers may simply not call anything. */
  resolveReconciliationCancel(): void { /* deliberately a no-op */ }

  private peekValidResumeIntent(): { guestOwnerScope: string; guestDraft: AiCreateDraftEnvelope } | null {
    let intentRaw: string | null;
    try { intentRaw = localStorage.getItem(RESUME_INTENT_KEY); } catch (_) { return null; }
    if (!intentRaw) return null;
    let intent: any;
    try { intent = JSON.parse(intentRaw); } catch (_) { return null; }
    const guestOwnerScope: string = intent && intent.ownerScope;
    if (!this.isGuestScope(guestOwnerScope)) return null;
    const guestDraft = this.load(guestOwnerScope);
    if (!guestDraft) return null;
    return { guestOwnerScope, guestDraft };
  }

  private consumeResumeIntent(): void {
    // One-shot: a later, unrelated sign-in on this browser can never reuse a stale pointer.
    try { localStorage.removeItem(RESUME_INTENT_KEY); } catch (_) {}
  }

  private writeAdoptedDraft(authenticatedOwnerScope: string, peek: { guestOwnerScope: string; guestDraft: AiCreateDraftEnvelope }): void {
    const adopted: AiCreateDraftEnvelope = { ...peek.guestDraft, ownerScope: authenticatedOwnerScope, updatedAt: new Date().toISOString() };
    const key = this.keyFor(authenticatedOwnerScope);
    try {
      localStorage.setItem(key, JSON.stringify(adopted));
      if (localStorage.getItem(key) === JSON.stringify(adopted)) {
        // Verified write landed -- now safe to remove the guest-scoped source.
        try { localStorage.removeItem(this.keyFor(peek.guestOwnerScope)); } catch (_) {}
        try { localStorage.removeItem(GUEST_JOURNEY_POINTER_KEY); } catch (_) {}
      }
    } catch (_) {}
  }

  /** Safe migration from superseded storage formats into the current v2
   *  owner-isolated model. Always write-new -> verify-new -> remove-old;
   *  never removes an old key before a successful write of the new one.
   *  Safe to call unconditionally on load -- no-ops if there's nothing to
   *  migrate. `ownerScope` is the CALLER's already-resolved current scope
   *  (a guest journey scope or an authenticated uid). */
  migrateLegacyDraftIfPresent(ownerScope: string): void {
    this.migrateV1IfPresent(ownerScope);
    this.migrateLegacyJobDraftIfPresent(ownerScope);
  }

  /** v1 (this session's prior single-slot model) -> v2. An authenticated
   *  v1 draft (ownerScope was a real uid) migrates directly to that same
   *  uid's new v2 key -- unambiguous, safe. A v1 draft that was guest-scoped
   *  (the old flat 'guest' marker, no journey identity) is deliberately NOT
   *  migrated into an arbitrary current scope -- v1 never recorded which
   *  guest journey it belonged to, so there is no safe way to verify it
   *  matches the current caller (the exact risk TAB 09 exists to prevent).
   *  It is simply dropped; v1 only ever existed transiently within this
   *  session, so this is not a real-world data-loss concern. */
  private migrateV1IfPresent(ownerScope: string): void {
    let raw: string | null;
    try { raw = localStorage.getItem(LEGACY_V1_KEY); } catch (_) { return; }
    if (!raw) return;

    let legacy: any;
    try { legacy = JSON.parse(raw); } catch (_) {
      try { localStorage.removeItem(LEGACY_V1_KEY); } catch (_) {}
      return;
    }

    const expiresAt = legacy && Date.parse(legacy.expiresAt);
    const validShape = legacy && legacy.input && typeof legacy.input === 'object' && typeof legacy.ownerScope === 'string';
    if (!validShape || !expiresAt || Date.now() > expiresAt || legacy.ownerScope === 'guest') {
      try { localStorage.removeItem(LEGACY_V1_KEY); } catch (_) {}
      return;
    }

    const targetScope = legacy.ownerScope; // a real authenticated uid
    if (this.hasPending(targetScope)) {
      try { localStorage.removeItem(LEGACY_V1_KEY); } catch (_) {}
      return;
    }

    const wrote = this.save(legacy.input, targetScope, (legacy.source || 'v1') + '+v1-migration', legacy.status || 'editing', legacy.generated);
    if (wrote) {
      try { localStorage.removeItem(LEGACY_V1_KEY); } catch (_) {}
    }
    // If the write failed, deliberately leave the v1 key in place -- never
    // lose data by removing the old copy before the new one is confirmed.
  }

  /** One-time safe migration from the original GuestJobDraftService key
   *  (the pre-AI-Create "restore into Start From Scratch" model) into the
   *  current AI Create draft model. */
  private migrateLegacyJobDraftIfPresent(ownerScope: string): void {
    let raw: string | null;
    try { raw = localStorage.getItem(LEGACY_JOBDRAFT_KEY); } catch (_) { return; }
    if (!raw) return;

    let legacy: any;
    try { legacy = JSON.parse(raw); } catch (_) {
      try { localStorage.removeItem(LEGACY_JOBDRAFT_KEY); } catch (_) {}
      return;
    }

    const expiresAt = legacy && Date.parse(legacy.expiresAt);
    const validShape = legacy && legacy.payload && typeof legacy.payload === 'object';
    if (!validShape || !expiresAt || Date.now() > expiresAt) {
      // Malformed or expired -- do not migrate; just drop the stale key.
      try { localStorage.removeItem(LEGACY_JOBDRAFT_KEY); } catch (_) {}
      return;
    }

    // Don't clobber an already-existing AI Create draft for this scope.
    if (this.hasPending(ownerScope)) {
      try { localStorage.removeItem(LEGACY_JOBDRAFT_KEY); } catch (_) {}
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
      try { localStorage.removeItem(LEGACY_JOBDRAFT_KEY); } catch (_) {}
      return;
    }

    const wrote = this.save(input, ownerScope, 'legacy-jobdraft-migration');
    if (wrote) {
      try { localStorage.removeItem(LEGACY_JOBDRAFT_KEY); } catch (_) {}
    }
    // If the write failed, deliberately leave the legacy key in place --
    // never lose data by removing the old copy before the new one is
    // confirmed to exist.
  }

  private keyFor(ownerScope: string): string {
    return KEY_PREFIX + encodeURIComponent(ownerScope);
  }

  private readRawAt(key: string): AiCreateDraftEnvelope | null {
    let raw: string | null;
    try { raw = localStorage.getItem(key); } catch (_) { return null; }
    if (!raw) return null;

    let parsed: any;
    try { parsed = JSON.parse(raw); } catch (_) {
      try { localStorage.removeItem(key); } catch (_) {}
      return null;
    }

    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
    if (parsed.intent !== 'employer-ai-create-job') return null;
    if (!parsed.input || typeof parsed.input !== 'object') return null;

    const expiresAt = Date.parse(parsed.expiresAt);
    if (!expiresAt || Date.now() > expiresAt) {
      try { localStorage.removeItem(key); } catch (_) {}
      return null;
    }

    return parsed as AiCreateDraftEnvelope;
  }

  private generateId(): string {
    return 'aicd_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
  }
}
