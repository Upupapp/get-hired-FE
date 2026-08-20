import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import {
  AnonPreviewResponse,
  PublicJobPreviewService,
} from '../../services/public-job-preview.service';
import { HapticFeedbackService } from '@app-shared/services/haptic-feedback/haptic-feedback.service';
import { GoogleAuthService } from '@main/auth/services/google-auth.service';
import { CoreService } from '@app-core/services/core.service';
import { AiCreateDraftService } from '@app-job/services/ai-create-draft.service';
import { GenerateIntentInputs } from '@app-job/easy-job-post-assistant/easy-job-post-assistant.models';

type PanelStep = 'input' | 'loading' | 'preview' | 'error';

@Component({
  selector: 'app-ai-job-preview-panel',
  templateUrl: './ai-job-preview-panel.component.html',
  styleUrls: ['./ai-job-preview-panel.component.scss'],
})
export class AiJobPreviewPanelComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  step: PanelStep = 'input';
  jobTitle = '';
  location = '';
  workSetup = '';
  employmentType = '';
  titleError = '';
  errorMsg = '';
  previewData: AnonPreviewResponse | null = null;
  googleLoading = false;
  googleError: string | null = null;

  readonly workSetupOptions = [
    { value: '', label: 'Any' },
    { value: 'On-site', label: 'On-site' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' },
  ];

  readonly employmentTypeOptions = [
    { value: '', label: 'Any' },
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Freelance', label: 'Freelance' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private previewService: PublicJobPreviewService,
    private router: Router,
    private haptics: HapticFeedbackService,
    private googleAuthService: GoogleAuthService,
    private coreService: CoreService,
    private aiCreateDraft: AiCreateDraftService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const openChange = changes['open'];
    if (!openChange) return;
    if (openChange.currentValue) {
      this.resetToInput();
      if (isPlatformBrowser(this.platformId)) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      if (isPlatformBrowser(this.platformId)) {
        document.body.style.overflow = '';
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  private resetToInput(): void {
    this.step = 'input';
    this.jobTitle = '';
    this.location = '';
    this.workSetup = '';
    this.employmentType = '';
    this.titleError = '';
    this.errorMsg = '';
    this.previewData = null;
  }

  close(): void {
    this.haptics.press();
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('aijp-backdrop')) {
      this.close();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.close();
  }

  generate(): void {
    this.titleError = '';
    const title = this.jobTitle.trim();
    if (!title) {
      this.titleError = 'Job title is required.';
      return;
    }
    if (title.length < 2) {
      this.titleError = 'Job title is too short.';
      return;
    }

    this.haptics.selection();

    // AUTH-STATE CLASSIFICATION (2026-08-20) -- resolved client-side, before
    // any authenticated-dependent operation is attempted. A true first-time
    // guest must never discover their auth state via a failing API request:
    // that previously produced a misleading "Could not generate preview"
    // error for someone who was never signed in. See
    // GETHIRED_UNIFIED_FE_UIUX_CONTINUATION_AND_EMPLOYER_JOB_POST_FLOW_REFINEMENT_COMMAND_V1.
    const isLoggedIn = this.coreService.isLoggedIn();
    const role = isLoggedIn ? localStorage.getItem('role') : null;

    if (!isLoggedIn) {
      // GENUINE GUEST -- no session to expire, nothing to authenticate.
      // Skip the preview API entirely; go straight to draft + registration.
      this.saveDraftAndRedirectToRegister(title);
      return;
    }

    if (role !== '2') {
      // AUTHENTICATED NON-EMPLOYER -- never create a job under the wrong
      // account/role. Preserve the intent (the draft still restores
      // correctly once the account actually has Employer access) but don't
      // call the preview API, and don't fabricate a role-upgrade route that
      // may not exist -- surface an accurate, actionable message instead.
      this.saveDraftPayload(title);
      this.haptics.error();
      this.errorMsg = 'This account isn’t set up as an Employer account yet. Sign in with an Employer account, or create a new one, to continue with this job post.';
      this.step = 'error';
      return;
    }

    // AUTHENTICATED EMPLOYER (or a previously-authenticated session that has
    // since actually expired -- indistinguishable from here without making
    // the request; a real 401/403 on this call falls through to the global
    // interceptor's existing re-auth flow, which now preserves any pending
    // guest draft across that logout -- see CoreService.logout()).
    this.step = 'loading';
    this.errorMsg = '';

    this.previewService.generatePreview({
      jobTitle: title,
      location: this.location.trim() || undefined,
      workSetup: this.workSetup || undefined,
      employmentType: this.employmentType || undefined,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.previewData = res;
        this.step = 'preview';
        this.haptics.success();
      },
      error: (err) => {
        this.haptics.error();
        const errBody = err && err.error;
        this.errorMsg = (errBody && errBody.message) || 'Could not generate preview. Please try again.';
        this.step = 'error';
      },
    });
  }

  /** Maps this panel's fields directly into the AI Create panel's own
   *  GenerateIntentInputs shape (EasyJobPostAssistantModalComponent) and
   *  persists it as a pending guest AI Create draft -- these are exactly
   *  the same four fields the guest was actually shown, verbatim, so
   *  restoration into AI Create is exact rather than approximated. Industry
   *  is deliberately never set here: it was never collected on this public
   *  form, so no value must be invented (AI Create's own restore path
   *  handles suggesting/leaving it empty -- see job-industry-suggester.ts).
   *  workSetup is normalized to AI Create's own option values ('Onsite',
   *  not this panel's 'On-site'), and employmentType to the real
   *  gethired.job_type names ('Full time'/'Part time'/'Contractor', not this
   *  panel's own hyphenated 'Full-time'/'Part-time'/'Contract') now that AI
   *  Create's Employment type select is populated from the live job-type
   *  list (see DRAFT-SAVE FIX in easy-job-post-assistant-modal.component.ts)
   *  -- otherwise the restored value wouldn't match any of that dropdown's
   *  <option>s and would silently show unselected. */
  private static readonly EMPLOYMENT_TYPE_TO_AI_CREATE: { [key: string]: string } = {
    'Full-time': 'Full time',
    'Part-time': 'Part time',
    'Contract': 'Contractor',
  };

  private saveDraftPayload(title: string): string {
    const input: GenerateIntentInputs = {
      jobTitle: title,
      location: this.location.trim(),
      workSetup: this.workSetup === 'On-site' ? 'Onsite' : this.workSetup,
      employmentType: AiJobPreviewPanelComponent.EMPLOYMENT_TYPE_TO_AI_CREATE[this.employmentType] || this.employmentType,
    };
    const ownerScope = this.resolveOwnerScopeForDraftSave();
    this.aiCreateDraft.save(input, ownerScope, 'public-employer-ai-preview-panel', 'pending-registration');
    return ownerScope;
  }

  /** STORAGE-SAFETY FIX: this panel is reachable while already authenticated
   *  (see the role !== '2' branch above) -- it must never persist under a
   *  guest scope in that case, since each owner scope now has its own
   *  isolated key (ai-create-draft.service.ts, TAB 06) but a signed-in
   *  non-Employer account writing under a guest journey it doesn't own
   *  would still be meaningless (nothing will ever adopt it into that
   *  account) and could collide with a real guest using this same browser.
   *  Only a real, unauthenticated visitor gets a guest journey scope; any
   *  authenticated visitor uses their own stable uid. */
  private resolveOwnerScopeForDraftSave(): string {
    if (!this.coreService.isLoggedIn()) return this.aiCreateDraft.getOrCreateGuestOwnerScope();
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return (user && user._id) ? user._id : this.aiCreateDraft.getOrCreateGuestOwnerScope();
  }

  private saveDraftAndRedirectToRegister(title: string): void {
    const ownerScope = this.saveDraftPayload(title);
    // Bind this exact guest journey as the one eligible for adoption once
    // registration completes (TAB 09) -- no-ops if ownerScope isn't a guest
    // scope (e.g. an authenticated non-Employer landed here, see above).
    this.aiCreateDraft.markResumeIntent(ownerScope);
    this.haptics.selection();
    this.closed.emit();
    this.router.navigate(['/signup'], { queryParams: { role: 2, intent: 'resume-job-draft' } });
  }

  goSignup(): void {
    if (this.previewData && this.previewData.previewToken) {
      this.previewService.savePendingToken(this.previewData.previewToken);
    }
    this.haptics.selection();
    this.closed.emit();
    this.router.navigate(['/signup'], { queryParams: { role: 2 } });
  }

  goSignin(): void {
    if (this.previewData && this.previewData.previewToken) {
      this.previewService.savePendingToken(this.previewData.previewToken);
    }
    this.haptics.selection();
    this.closed.emit();
    this.router.navigate(['/signin']);
  }

  // Google sign-in directly from the AI Job Create panel gate
  onGoogleCredential(googleIdToken: string): void {
    if (this.googleLoading) return;
    // Save preview token before any navigation
    if (this.previewData && this.previewData.previewToken) {
      this.previewService.savePendingToken(this.previewData.previewToken);
    }
    this.googleLoading = true;
    this.googleError = null;

    this.googleAuthService.exchangeGoogleToken(googleIdToken)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.googleLoading = false;
          if (response.status === 'role_required') {
            // New user — store pending state and navigate to role classification
            this.googleAuthService.handleGoogleSessionResponse(response);
            this.closed.emit();
            this.router.navigate(['/auth/choose-role']);
          } else {
            const outcome = this.googleAuthService.handleGoogleSessionResponse(response);
            if (outcome === 'authenticated') {
              // Existing user — session stored, employer panel will claim the draft
              this.closed.emit();
            } else {
              this.googleError = response.message || 'Google sign-in failed. Please try again.';
            }
          }
        },
        error: (err) => {
          this.googleLoading = false;
          const body = err && err.error;
          this.googleError = (body && body.message) || 'Google sign-in did not complete. Try again or use email.';
        }
      });
  }

  onGoogleError(errorCode: string): void {
    if (errorCode === 'google_popup_closed' || errorCode === 'google_prompt_dismissed') return;
    this.googleError = 'Google sign-in did not complete. Try again or use email.';
  }

  tryAgain(): void {
    this.resetToInput();
  }

  get previewTitle(): string {
    return this.previewData && this.previewData.partialPreview
      ? this.previewData.partialPreview.title
      : '';
  }

  get previewSnippet(): string {
    return this.previewData && this.previewData.partialPreview
      ? this.previewData.partialPreview.snippet
      : '';
  }

  get previewSkills(): string[] {
    return this.previewData && this.previewData.partialPreview
      ? this.previewData.partialPreview.skills
      : [];
  }
}
