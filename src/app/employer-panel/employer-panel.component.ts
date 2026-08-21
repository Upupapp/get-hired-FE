import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EasyJobPostAssistantModalComponent } from '@app-job/easy-job-post-assistant/easy-job-post-assistant-modal/easy-job-post-assistant-modal.component';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CompanyNotSetupComponent } from '@main/company/company-not-setup/company-not-setup.component';
import { SignOutConfirmDialogComponent } from '@app-shared/components/sign-out-confirm-dialog/sign-out-confirm-dialog.component';
import { CompanyFacade } from '@main/company/state/company.facade';
import { CoreService } from '@main/core/services/core.service';
import { EmployeeFacade } from '@main/employee/state/employee.facade';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { Observable, Subscription } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { PublicJobPreviewService } from '@main/public/services/public-job-preview.service';
import { AiCreateDraftService } from '@app-job/services/ai-create-draft.service';
import { AiRecoveryReconciliationDialogComponent, AiRecoveryReconciliationResult } from '@app-shared/components/ai-recovery-reconciliation-dialog/ai-recovery-reconciliation-dialog.component';

@Component({
  selector: 'app-employer-panel',
  templateUrl: './employer-panel.component.html',
  styleUrls: ['./employer-panel.component.scss'],
  animations: [mainAnimations]
})
export class EmployerPanelComponent implements OnInit, OnDestroy {
  isUserLoggedIn: boolean;
  user = JSON.parse(localStorage.getItem('user'));
  employee$ = this.employeeFacade.employeeDetails$;
  loading$ = this.employeeFacade.loading$;

  // B02: Mobile drawer state
  mobileNavOpen = false;

  avatarMenuOpen = false;
  companyNameForTopbar$: Observable<string>;
  companyLogoUrl$: Observable<string>;

  @ViewChild('mobileMenuBtn') mobileMenuBtnRef: ElementRef<HTMLButtonElement>;
  @ViewChild('firstDrawerLink') firstDrawerLinkRef: ElementRef<HTMLAnchorElement>;

  private routerSub: Subscription;
  private queryParamsSub: Subscription;
  private aiCreateDraftGateSub: Subscription;
  private logoutInProgress = false;

  constructor(
    private coreService: CoreService,
    private employeeFacade: EmployeeFacade,
    private companyFacade: CompanyFacade,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private jobPreviewService: PublicJobPreviewService,
    private aiCreateDraft: AiCreateDraftService,
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.coreService.isLoggedIn();
    this.employeeFacade.getEmployeeProfile(this.user._id);
    this.checkAndClaimAiPreview();

    // AUTH-ROUTE RECOVERY LEAK FIX: this used to run immediately on mount,
    // trusting only the local `state`/`user` flags read at component
    // construction. Those flags can be stale (e.g. left over from an
    // earlier session that was never explicitly signed out of) -- if a
    // stale/invalid session lands here, opening the AI Create modal before
    // the profile fetch above has even resolved means a browser that isn't
    // really authenticated can still see (and appear to "leak") whatever
    // recovery happens to be associated with that stale local user id.
    // Now gated on the FIRST successful, server-confirmed employee profile
    // emission -- if the session is actually invalid, this fetch 401s, the
    // existing profile-load-error fallback (signInAgain()) handles it, and
    // this callback simply never fires; no AI modal, no premature adoption.
    this.aiCreateDraftGateSub = this.employee$.pipe(filter(e => !!e), take(1)).subscribe(() => {
      this.checkAndRouteToAiCreateDraft();
    });

    // PRODUCT CHANGE: a new Employer arrives here right after finishing
    // Business Setup with ?openAiCreate=1 (see CompanyDetailsFormComponent's
    // 'created' branch). Company Settings is a CHILD route of this same
    // EmployerPanelComponent shell, so navigating here does not recreate
    // this component -- ngOnInit alone would miss it. Subscribed (not just
    // read once) so it also fires for that in-app navigation. Reuses
    // goToCreateJob(), the exact same method the dashboard's "Create a Job"
    // button calls, so this is genuinely the same flow an existing Employer
    // gets, not a parallel one. The param is cleared immediately after
    // acting so it can't re-fire on browser refresh/back.
    this.queryParamsSub = this.route.queryParams.subscribe(params => {
      if (params && params['openAiCreate']) {
        this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true })
          .then(() => this.goToCreateJob());
      }
    });

    // companyName for topbar avatar menu — reads from companyFacade.companyDetails$
    // (the authoritative store slice) so it updates immediately when the recruiter
    // saves company settings, without waiting for a getEmployeeProfile() re-fetch.
    this.companyNameForTopbar$ = this.companyFacade.companyDetails$.pipe(
      map(company => (company && company.companyName) ? company.companyName : '')
    );
    this.companyLogoUrl$ = this.companyFacade.companyDetails$.pipe(
      map(company => (company && company.companyLogoUrl) ? company.companyLogoUrl : '')
    );

    // B02: Close mobile drawer on every successful navigation
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.closeMobileNav());
  }

  // B02: Open mobile nav drawer
  openMobileNav(): void {
    this.mobileNavOpen = true;
    // Move focus into drawer after CSS transition completes
    setTimeout(() => {
      if (this.firstDrawerLinkRef?.nativeElement) {
        this.firstDrawerLinkRef.nativeElement.focus();
      }
    }, 200);
  }

  // B02: Close mobile nav drawer and return focus to menu button
  closeMobileNav(): void {
    if (!this.mobileNavOpen) return;
    this.mobileNavOpen = false;
    // Return focus to hamburger button after drawer closes
    setTimeout(() => {
      if (this.mobileMenuBtnRef?.nativeElement) {
        this.mobileMenuBtnRef.nativeElement.focus();
      }
    }, 50);
  }

  // B02: Global Escape handler — closes drawer from anywhere on the page
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.mobileNavOpen) {
      this.closeMobileNav();
    }
    if (this.avatarMenuOpen) {
      this.closeAvatarMenu();
    }
  }

  // Close avatar menu on outside click
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.avatarMenuOpen && target && !target.closest('.gh-topbar-avatar-wrap')) {
      this.closeAvatarMenu();
    }
  }

  // Guards against a duplicate claim within the same page life (e.g. a
  // component re-init quirk re-running ngOnInit before the first claim
  // request resolves). A full page reload always aborts any in-flight
  // request, so this only needs to cover same-tab, same-load duplication --
  // true cross-request exactly-once still requires a backend-side atomic
  // claim (see GETHIRED_EMPLOYER_START_HIRING_MASTER_COMMAND note in
  // get-hired-BE/notes.md).
  private aiPreviewClaimInFlight = false;

  // ─── AI Preview Claim — runs once on employer panel init ────────────────
  // If the user arrived here via the public AI preview flow (signed up / signed
  // in after generating a preview), claim the draft and navigate to job list.
  private checkAndClaimAiPreview(): void {
    const token = this.jobPreviewService.getPendingToken();
    if (!token || this.aiPreviewClaimInFlight) return;
    this.aiPreviewClaimInFlight = true;

    this.jobPreviewService.claimPreview(token)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.aiPreviewClaimInFlight = false;
          this.jobPreviewService.clearPendingToken();
          if (res && res.jobId) {
            this.router.navigate(['/recruiter/jobs/list'], {
              queryParams: { claimedDraft: '1' },
            });
          }
        },
        error: () => {
          // Non-fatal — token may have expired; clear it silently and continue
          this.aiPreviewClaimInFlight = false;
          this.jobPreviewService.clearPendingToken();
        },
      });
  }

  // ─── AI Create Draft Routing — runs once on employer panel init ─────────
  // GETHIRED_EMPLOYER_AI_CREATE_PERSISTENT_UNFINISHED_JOB_DRAFT_FLOW_V2:
  // the unfinished-job workspace now belongs exclusively to AI Create
  // (EasyJobPostAssistantModalComponent's Generate step) -- Start From
  // Scratch (JobCreateComponent reached directly, no assistant prefill) no
  // longer auto-restores anything. If a first-time guest saved an AI Create
  // draft before registering (see ai-job-preview-panel.component.ts), adopt
  // it into this now-authenticated user's own draft scope, then: no company
  // yet -> Business Setup first (same sequencing as before, draft
  // untouched); has company -> open AI Create directly instead of
  // navigating anywhere, so the panel's own restore/resume UX takes over.
  private checkAndRouteToAiCreateDraft(): void {
    const ownerScope = this.user && this.user._id;
    if (!ownerScope) return;

    // One-time safe migration from the superseded jobDraft.v1 key (the old
    // Start-From-Scratch restore mechanism). No-op when there's nothing to
    // migrate.
    this.aiCreateDraft.migrateLegacyDraftIfPresent(ownerScope);

    // RECONCILIATION: this Employer already has their own AI Create
    // recovery AND a still-valid guest recovery from their own Start-Hiring
    // resume journey both exist -- never silently pick one. Exactly one
    // explicit user decision, never a second AI Create panel.
    const collision = this.aiCreateDraft.detectReconciliation(ownerScope);
    if (collision) {
      const dialogRef = this.dialog.open(AiRecoveryReconciliationDialogComponent, {
        ariaLabel: 'Unfinished AI job post reconciliation',
        autoFocus: 'first-tabbable',
        data: {
          existingTitle: collision.employerDraft.input.jobTitle || '',
          newTitle: collision.guestDraft.input.jobTitle || '',
        },
      });
      dialogRef.afterClosed().subscribe((result: AiRecoveryReconciliationResult | undefined) => {
        if (result === 'continue') {
          this.aiCreateDraft.resolveReconciliationContinueExisting(ownerScope);
        } else if (result === 'new') {
          this.aiCreateDraft.resolveReconciliationUseNewJob(ownerScope);
        } else {
          // Cancel / X / Escape / backdrop: neither recovery is touched --
          // remain on the current route, no auto-navigation into either flow.
          return;
        }
        this.proceedAfterAiCreateDraftCheck(ownerScope);
      });
      return;
    }

    // No collision -- existing safe behavior unchanged: adopt a pending
    // guest draft only if this owner has no recovery of their own yet
    // (adoptGuestDraftForUser never clobbers an existing one).
    this.aiCreateDraft.adoptGuestDraftForUser(ownerScope);
    this.proceedAfterAiCreateDraftCheck(ownerScope);
  }

  private proceedAfterAiCreateDraftCheck(ownerScope: string): void {
    if (!this.aiCreateDraft.hasPending(ownerScope)) return;

    const hasCompany = !!this.user.companyId;
    if (!hasCompany) {
      this.router.navigate(['/recruiter/company/settings']);
      return;
    }

    this.goToCreateJob();
  }

  /** Called from the "sign in again" button on the profile-load-error fallback.
   *  Clears the session and navigates to /signin so the guard doesn't re-admit. */
  signInAgain(): void {
    this.coreService.logout();
    this.router.navigate(['/signin']);
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
    if (this.queryParamsSub) this.queryParamsSub.unsubscribe();
    if (this.aiCreateDraftGateSub) this.aiCreateDraftGateSub.unsubscribe();
  }

  get pageTitle(): string {
    const url = this.router.url;
    if (url.includes('/jobs/list'))           return 'Job Posts';
    if (url.includes('/jobs/expired'))        return 'Expired Jobs';
    if (url.includes('/jobs/create'))         return 'Post a Job';
    if (url.includes('/jobs/edit'))           return 'Edit Job';
    if (url.includes('/jobs/applicants'))     return 'Applicants';
    if (url.includes('/jobs/view'))           return 'Job Preview';
    if (url.includes('/jobs/dashboard'))      return 'Job Overview';
    if (url.includes('/jobs'))                return 'Jobs';
    if (url.includes('/contacts/list'))       return 'Contact List';
    if (url.includes('/contacts/candidates')) return 'Applicants';
    if (url.includes('/contacts/candidate-list')) return 'Candidate Profile';
    if (url.includes('/contacts/groups'))     return 'Contact Groups';
    if (url.includes('/contacts/group-list')) return 'Contact Group';
    if (url.includes('/contacts'))            return 'Candidates';
    if (url.includes('/interview'))           return 'Interviews';
    if (url.includes('/messages'))            return 'Messages';
    if (url.includes('/company'))             return 'Company';
    if (url.includes('/subscription'))        return 'Subscription';
    if (url.includes('/dashboard'))           return 'Dashboard';
    return 'Dashboard';
  }

  get parentLabel(): string {
    const url = this.router.url;
    if (url.includes('/jobs/list') || url.includes('/jobs/expired') ||
        url.includes('/jobs/create') || url.includes('/jobs/edit') ||
        url.includes('/jobs/applicants') || url.includes('/jobs/view') ||
        url.includes('/jobs/dashboard'))      return 'Jobs';
    if (url.includes('/contacts/list') || url.includes('/contacts/candidates') ||
        url.includes('/contacts/candidate-list') || url.includes('/contacts/groups') ||
        url.includes('/contacts/group-list')) return 'Candidates';
    if (url.includes('/interview') || url.includes('/messages')) return 'Hiring Workspace';
    if (url.includes('/company'))             return 'Company';
    if (url.includes('/subscription'))        return 'Account';
    return '';
  }

  get pageSubtitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard'))               return 'Track job activity, applicants, and hiring health.';
    if (url.includes('/jobs/list'))               return 'Manage published, draft, and expired job posts.';
    if (url.includes('/jobs/expired'))            return 'Review closed or expired jobs for reference or reuse.';
    if (url.includes('/jobs/create'))             return 'Build and publish your job post step by step.';
    if (url.includes('/jobs/edit'))               return 'Update this job post and republish changes.';
    if (url.includes('/jobs/applicants'))         return 'Review candidates who applied to this job.';
    if (url.includes('/contacts/list'))           return 'Manage candidate contacts and outreach records.';
    if (url.includes('/contacts/candidates'))     return 'Review all candidates who applied to your jobs.';
    if (url.includes('/contacts/candidate-list')) return 'Review this candidate\'s application and profile.';
    if (url.includes('/contacts/groups'))         return 'Organise contacts into groups for hiring campaigns.';
    if (url.includes('/interview'))               return 'Review interview activity and candidate video responses.';
    if (url.includes('/messages'))                return 'Manage candidate conversations across your jobs.';
    if (url.includes('/company'))                 return 'Manage your employer brand and public company profile.';
    if (url.includes('/subscription'))            return 'Manage your GetHired plan and billing settings.';
    return '';
  }

  toggleAvatarMenu(): void {
    this.avatarMenuOpen = !this.avatarMenuOpen;
  }

  closeAvatarMenu(): void {
    this.avatarMenuOpen = false;
  }

  goToCreateJob(): void {
    this.dialog.open(EasyJobPostAssistantModalComponent, {
      width: '560px',
      maxWidth: '96vw',
      panelClass: 'gh-assistant-dialog',
    });
  }

  /** AI CREATE SINGLE-RECOVERY: this app renders exactly one AI Create
   *  entry point (this topbar button) -- when the Employer already has a
   *  pending local recovery, its label reflects that instead of implying a
   *  fresh/empty flow, so it's clear reopening it resumes existing work
   *  rather than starting something new. */
  get postJobButtonLabel(): string {
    return this.hasPendingAiCreateRecovery() ? 'Continue unfinished job' : 'Post a job';
  }

  hasPendingAiCreateRecovery(): boolean {
    return !!(this.user && this.user._id && this.aiCreateDraft.hasPending(this.user._id));
  }

  goToJobsList(): void {
    this.router.navigate(['/recruiter/contacts/candidates']);
  }

  /** GETHIRED_EMPLOYER_PORTAL_SIGNOUT_FIX: confirm before signing out via a
   *  purpose-built SignOutConfirmDialogComponent (title, message, an X close
   *  button in the corner, plus Cancel/Sign Out). `onConfirm` doesn't close
   *  the dialog itself -- that lets the Sign Out button show a disabled/
   *  loading state while the canonical coreService.logout() call runs.
   *  Cancel, the X button, and Escape/backdrop-click (MatDialog's own
   *  default -- disableClose is deliberately left false) are all equivalent:
   *  they just close the dialog with zero auth/session side effects. */
  logout(): void {
    // FINAL SIGN-OUT POLICY: normal sign-out preserves local AI recovery --
    // the checkbox (an explicit opt-in to delete it) is only offered when
    // this Employer actually has removable local recovery on this device.
    // This answers "does LOCAL recovery exist", never "does a server Draft
    // exist" -- a synced server Draft is never affected either way.
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    const hasLocalRecovery = !!(currentUser && currentUser._id && this.aiCreateDraft.hasPending(currentUser._id));
    const hasUnsyncedLocalEdits = hasLocalRecovery && this.aiCreateDraft.hasUnsyncedLocalEdits(currentUser._id);

    const dialogRef = this.dialog.open(SignOutConfirmDialogComponent, {
      ariaLabel: 'Sign out confirmation',
      autoFocus: 'first-tabbable',
      data: {
        showRemoveLocalRecoveryOption: hasLocalRecovery,
        hasUnsyncedLocalEdits,
        onConfirm: () => this.confirmSignOut(dialogRef),
      },
    });
  }

  private confirmSignOut(dialogRef: MatDialogRef<SignOutConfirmDialogComponent>): void {
    if (this.logoutInProgress) return; // duplicate-click guard
    this.logoutInProgress = true;

    const instance = dialogRef.componentInstance;
    // Read the checkbox and capture the current user's id before logout
    // wipes `user` from localStorage -- removal only happens if explicitly
    // requested, and even then only the LOCAL recovery key
    // (aiCreateDraft.clear() never touches a canonical server Draft job).
    const removeLocalRecovery = instance.removeLocalRecovery;
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    instance.confirmDisabled = true;
    instance.confirmLabel = 'Signing out...';

    this.coreService.logout().subscribe({
      next: () => {
        this.logoutInProgress = false;
        if (removeLocalRecovery && currentUser && currentUser._id) {
          this.aiCreateDraft.clear(currentUser._id);
        }
        // Redirect ONLY after logout has actually completed, and only Home --
        // never dashboard/signin/register/the previous protected page.
        dialogRef.close();
        this.router.navigateByUrl('/');
      },
      error: () => {
        // coreService.logout()'s local state-clear has no real failure mode
        // (synchronous localStorage writes; the backend revoke call is
        // already caught internally and never surfaces here) -- this branch
        // exists so a future failure mode is handled truthfully rather than
        // silently, per the "never fabricate success" requirement.
        this.logoutInProgress = false;
        instance.confirmDisabled = false;
        instance.confirmLabel = 'Sign Out';
      },
    });
  }
}
