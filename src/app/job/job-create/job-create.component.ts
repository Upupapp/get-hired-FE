import { Component, OnDestroy, OnInit, HostListener, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { JobFacade } from '@app-job/state/job.facade';
import { distinctUntilChanged, Subject, Subscription, take, debounceTime } from 'rxjs';
import * as Model from '../job.model';
import * as QuestionModel from '@main/interview/interview.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { map, takeUntil, tap } from 'rxjs/operators';
import { UpdatedDialogComponent } from '@app-shared/components/updated-dialog/updated-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SubscriptionAlertComponent } from '@app-shared/components/subscription-alert/subscription-alert.component';
import { TalentProofService } from '@main/public/services/talent-proof.service';
import { PublicPortalAnalyticsService } from '@main/public/services/public-portal-analytics.service';
import { HapticFeedbackService } from '@main/shared/services/haptic-feedback/haptic-feedback.service';
// B13: Job Readiness
import { JobReadinessService, JobReadinessResult, JobReadinessLevel, JobReadinessSectionStatus } from '../services/job-readiness.service';
import { EasyJobPostAssistantService } from '../easy-job-post-assistant/easy-job-post-assistant.service';
import { JobService } from '../job.service';
import { CreateInterviewComponent } from './components/create-interview/create-interview.component';
import { resolveJobLevelId } from '../utils/job-level-resolver';
import { resolveWorkSetupId, resolveJobTypeId, FREELANCE_JOB_TYPE_SENTINEL } from '../utils/job-field-resolvers';
import { AiCreateDraftService } from '../services/ai-create-draft.service';
import { CompanyNotSetupComponent } from '@main/company/company-not-setup/company-not-setup.component';

// Page-entrance fade animation (reduced-motion safe — Angular ignores if not supported)
const fadeInPage = trigger('fadeInPage', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(8px)' }),
    animate('220ms cubic-bezier(0.2,0,0,1)', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

@Component({
  selector: 'app-job-create',
  animations: [fadeInPage],
  templateUrl: './job-create.component.html',
  styleUrls: ['./job-create.component.scss'],
})
export class JobCreateComponent implements OnInit, OnDestroy {
  @ViewChild(CreateInterviewComponent) createInterviewRef: CreateInterviewComponent;

  public unsubscribe$ = new Subject<void>();
  questions: QuestionModel.InterviewQuestion[];

  isAllowedToPublish: boolean = true;
  companyId: string;
  mode: string;
  delayControl: boolean = true;
  public jobId: any = null;
  public screenWidth: number = 1200;
  subscriptions = new Subscription();
  // F-08 UX: track save-as-draft loading state separately from publish loading
  savingDraft: boolean = false;
  // F-08 UX: success pulse flag (shown briefly after backend success)
  saveSuccessPulse: boolean = false;
  // F-08 UX: error message from backend (403/404/500) — cleared on next attempt
  saveErrorMsg: string | null = null;

  // Comprehensive/Simplified job-post mode -- read from the `postMode` query
  // param in the constructor above. Purely a display flag: hides secondary/
  // detail sections in the template, never touches jobForm's model or the
  // save/publish/readiness gating logic below.
  postMode: 'comprehensive' | 'simplified' = 'comprehensive';
  get isSimplified(): boolean {
    return this.postMode === 'simplified';
  }

  /** Display-only: hides the Step 3 (Screening & Interview) tab/rail entry in
   *  Simplified mode. `stepperItems` itself is untouched -- index-based
   *  lookups in changeStep()/the template (stepperItems[n - 2], etc.) still
   *  rely on its original 4-item shape and must keep working unchanged. */
  get visibleStepperItems(): any[] {
    return this.isSimplified ? this.stepperItems.filter(i => i.id !== 3) : this.stepperItems;
  }

  /** Readiness "recommended" keys for sections intentionally hidden in
   *  Simplified mode (see job-readiness.service.ts's pushRec() calls for the
   *  full key list) -- display filtering only, does NOT touch evaluate()'s
   *  gating logic or scoring. */
  private static readonly SIMPLIFIED_HIDDEN_RECOMMENDATION_KEYS = new Set([
    'duties', 'skills', 'requirements', 'interview', 'education',
  ]);

  /** Same as readinessResult.recommendationItems, filtered for display so
   *  Simplified mode doesn't suggest filling in a section it isn't showing. */
  get visibleRecommendationItems(): any[] {
    const items = this.readinessResult?.recommendationItems || [];
    if (!this.isSimplified) return items;
    return items.filter(i => !JobCreateComponent.SIMPLIFIED_HIDDEN_RECOMMENDATION_KEYS.has(i.key));
  }

  // ── New v2 state ──────────────────────────────────────────────────────────
  /** Autosave indicator state: 'unsaved' | 'saving' | 'saved' | 'failed' */
  autoSaveState: 'unsaved' | 'saving' | 'saved' | 'failed' = 'unsaved';
  /** Validation error chips shown at step top after failed step-advance */
  stepErrorSummary: Array<{ fieldId: string; label: string }> = [];
  showStepErrors: boolean = false;
  /** Readiness rail group open/close state */
  readinessGroupOpen: { blocking: boolean; recommended: boolean; completed: boolean } = {
    blocking: true, recommended: false, completed: false
  };
  // QA8 FIX-10: separate bag for the form-status subscriptions added inside
  // setFormGroup(). Replaced on every call so multiple editJob$ emissions
  // don't accumulate duplicate statusChanges listeners across the lifetime of
  // the component. Unsubscribed in ngOnDestroy via the main subscriptions bag.
  private formSubs = new Subscription();
  // Autosave: timer ID for the debounced background draft save.
  // Only fires when jobId is already set (edit mode) to avoid creating
  // duplicate draft records on every keystroke during new-job creation.
  private autosaveTimerId: any = null;
  // Live job level options ({id, name}), fetched eagerly here (not only by the
  // Step-1 child) so AI hint resolution can run before the employer ever reaches Step 1.
  latestLevels: Model.Options[] = [];
  // Set when assistant-prefilled data still needs a job level match after the
  // live level list resolves, so we can nudge the employer exactly once.
  private jobLevelHintPending: string | null = null;
  private jobLevelConfirmationShown: boolean = false;
  // Set true when the form was just prefilled from the AI assistant and still
  // needs its first save; consumed inside the companyId-resolving promise below
  // since companyId isn't available synchronously in ngOnInit.
  private shouldPersistAssistantDraft: boolean = false;
  asyncLocalStorage = {
    setItem: async function (key, value) {
      await Promise.resolve();
      localStorage.setItem(key, value);
    },
    getItem: async function (key) {
      await Promise.resolve();
      return localStorage.getItem(key);
    },
  };

  jobForm: FormGroup;
  stepper: number = 1;
  initialFormValid: boolean = false;
  jobInfoValid: boolean = false;
  interviewValid: boolean = false;
  isReadyToPublish: boolean;
  loading: boolean = true;
  // B13: Job Readiness
  readinessResult: JobReadinessResult | null = null;
  // Easy Job Post Assistant prefill banner
  assistantPrefilled: boolean = false;
  initial$: any;
  info$: any;
  status: any = 1;
  stepperItems: any[] = [
    {
      id: 1,
      title: 'Job Basics',
      formName: 'initialData'
    },
    {
      id: 2,
      title: 'Requirements & Benefits',
      disabled: !this.initialFormValid,
      formName: 'jobInfo'
    },
    {
      id: 3,
      title: 'Screening & Interview',
      disabled: !this.jobInfoValid,
      formName: 'interview'
    },
    {
      id: 4,
      title: 'Preview & Publish',
      disabled: !this.interviewValid,
    },
  ];

  editJob$ = this.jobFacade.jobDetails$.pipe(
    map((job) => {
      return job;
    })
  );

  // QA7 FIX-9: tracked below in ngOnInit to ensure unsubscribe on destroy.
  loading$: any;

  restrictions$ = this.jobFacade.subsRestrictions$
    .pipe(
      tap(subs => {
        if (subs) this.getCompanyRestrictions(subs);
      })
    );

  constructor(
    private fb: FormBuilder,
    private jobFacade: JobFacade,
    private snackbarService: SnackbarService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private talentProof: TalentProofService,
    private talentProofAnalytics: PublicPortalAnalyticsService,
    private haptics: HapticFeedbackService,
    // B13: Job Readiness
    private jobReadiness: JobReadinessService,
    private assistantService: EasyJobPostAssistantService,
    private jobService: JobService,
    private aiCreateDraft: AiCreateDraftService,
  ) {
    this.route.queryParams.subscribe(params => {
      this.jobId = params.id;
      // Comprehensive/Simplified job-post mode: any direct/existing link to
      // /recruiter/jobs/create with no `postMode` param (or an unrecognized
      // value) keeps behaving exactly as before -- full Comprehensive form.
      this.postMode = params.postMode === 'simplified' ? 'simplified' : 'comprehensive';
    });
  }

  ngOnInit(): void {
    this.asyncLocalStorage.getItem('user')
      .then(user => {
        this.companyId = JSON.parse(user).companyId;

        // SEQUENCING FIX (2026-08-20): Create a Job must not proceed for an
        // Employer with no company yet -- job creation requires companyId
        // (see formatJob() below), and this page previously just loaded
        // with a null companyId instead of redirecting. Reuses the existing
        // CompanyNotSetupComponent dialog (already built for exactly this,
        // previously never actually wired up anywhere) rather than a new
        // implementation. Any pending guest job draft is untouched here --
        // EmployerPanelComponent's own company check already routes a
        // draft-bearing Employer to Setup before ever reaching this page,
        // so this is a defense-in-depth guard for direct/typed navigation.
        if (!this.companyId) {
          this.dialog.open(CompanyNotSetupComponent, { disableClose: true });
          this.router.navigate(['/recruiter/dashboard']);
          return;
        }

        this.jobFacade.getCompanySubscription(this.companyId);
        // companyId is only available here (async), so the first save of an
        // AI-prefilled draft is deferred until this point — see applyAssistantPrefill().
        if (this.shouldPersistAssistantDraft) {
          this.shouldPersistAssistantDraft = false;
          this.persistAssistantDraft(this.formatJob(1));
        }
      });

    // B15: eagerly fetch the live job level list here (normally only dispatched by
    // the Step-1 child component) so AI hint resolution can run before Step 1 mounts.
    this.jobFacade.getLevel();
    this.subscriptions.add(
      this.jobFacade.level$.subscribe((levels) => {
        this.latestLevels = levels || [];
        this.tryResolveJobLevelFromPendingHint();
      })
    );

    // FIX-02: success$ subscribed exactly once here (not inside setFormGroup,
    // which is called every time editJob$ emits, causing multiple subscribers
    // and therefore multiple dialogs on a single save-success event).
    this.subscriptions.add(
      this.jobFacade.success$
        .pipe().subscribe(this.afterSubmit.bind(this))
    );

    // F-08 UX: subscribe to job error stream to surface 403/404/500 messages.
    // Clears the loading/saving-draft spinner on any error so the user can retry.
    // jobError$ is state.error, set by saveJobFail/getJobFail/changeJobStatusFail.
    // We only act when we know a save was in-flight (savingDraft or loading).
    this.subscriptions.add(
      this.jobFacade.jobError$
        .pipe()
        .subscribe(err => {
          if (err && (this.savingDraft || this.loading)) {
            this.savingDraft = false;
            this.setAutoSaveState('failed');
            // Map common error strings to user-safe copy (no security internals exposed)
            const errStr = typeof err === 'string' ? err.toLowerCase() : '';
            if (errStr.includes('permission') || errStr.includes('access') || errStr.includes('not found')) {
              this.saveErrorMsg = "We couldn't update this job. It may no longer exist or you may not have access.";
            } else if (errStr.includes('review') || errStr.includes('missing') || errStr.includes('required') || errStr.includes('field')) {
              this.saveErrorMsg = "Please review the highlighted fields.";
            } else if (errStr.includes('session') || errStr.includes('token') || errStr.includes('expired') || errStr.includes('unauthorized') || errStr.includes('401')) {
              this.saveErrorMsg = "Your session has expired. Please sign in again.";
            } else {
              this.saveErrorMsg = "We couldn't update this job. Try again.";
            }
            this.cd.markForCheck();
          } else if (!err) {
            // Error cleared — reset message only if not still showing success
            if (!this.saveSuccessPulse) {
              this.saveErrorMsg = null;
            }
          }
        })
    );

    // QA7 FIX-9: track loading$ in the subscriptions bag so it is cleaned up on destroy.
    this.subscriptions.add(
      this.jobFacade.getJobLoading$.pipe().subscribe(this.onLoad.bind(this))
    );

    this.screenWidth = window.innerWidth;
    setTimeout(() => this.delayControl = false, 900);

    // QA7 FIX-9: track editJob$ subscription in the subscriptions bag.
    this.subscriptions.add(
      this.editJob$.subscribe((data: any) => {
        if (data) {
          this.setFormGroup(data);
          this.status = data.jobStatusId;
          // TAB 16 FIX: this also fires on a successful explicit Save Draft
          // (jobFacade.saveJob() -> saveJobSuccess sets state.selected), not
          // just on loading an existing job by route id. Previously this.jobId
          // was never assigned from that path, so a brand-new manual job's
          // FIRST Save Draft click created a record but a SECOND click still
          // had an empty jobId -> JobService.saveJob() took the create branch
          // again, producing a duplicate server job. The backend response's
          // own id is always the authoritative identity going forward.
          if (data.jobId) {
            this.jobId = data.jobId;
          }
        }
      })
    );

    if (this.jobId) {
      this.getJobById();
    } else {
      // Check for assistant prefill data before calling setFormGroup
      const assistantData = this.assistantService.getExtractionResult();
      if (assistantData) {
        this.assistantService.clearExtractionResult();
        this.assistantPrefilled = true;
        this.applyAssistantPrefill(assistantData);
        // Only persist a draft once there's a usable title — avoid saving an
        // empty/unusable record. Actual save deferred until companyId resolves.
        if (assistantData.jobTitle) {
          this.shouldPersistAssistantDraft = true;
        }
      } else {
        // PRODUCT CHANGE (2026-08-20): Start From Scratch is now always a
        // clean manual form -- it must never restore an AI Create draft
        // (or the superseded guest job draft this used to check). The
        // unfinished-job workspace belongs exclusively to AI Create
        // (EasyJobPostAssistantModalComponent's Generate step) now. See
        // GETHIRED_EMPLOYER_AI_CREATE_PERSISTENT_UNFINISHED_JOB_DRAFT_FLOW_SINGLE_COMMAND_V2.
        // Any pending AI Create draft is left completely untouched by this
        // page -- not read, not modified, not cleared.
        this.setFormGroup();
      }
    }
  }

  applyAssistantPrefill(data: any): void {
    // Job level options are a live backend-owned list (unlike work setup/job type,
    // which are matched against a fixed FE enum below) — resolve against whatever is
    // currently loaded. If the list hasn't arrived yet, this returns 'none' and
    // tryResolveJobLevelFromPendingHint() retries once jobFacade.level$ emits.
    const levelMatch = resolveJobLevelId(data.jobLevelHint, this.latestLevels);
    if (levelMatch.confidence !== 'high') {
      this.jobLevelHintPending = data.jobLevelHint || null;
    }

    // Build a partial job object that setFormGroup understands
    const prefillData: any = {
      jobTitle: data.jobTitle || null,
      jobCity: data.jobCity || null,
      jobCountry: data.jobCountry || 'Philippines',
      jobDescription: data.jobDescription || null,
      jobDuties: data.jobDuties || null,
      salaryMinimum: data.salaryMinimum || null,
      salaryMaximum: data.salaryMaximum || null,
      salaryCurrency: data.salaryCurrency || 'PHP',
      workSetupId: data.workSetupId || resolveWorkSetupId(data.workSetupHint),
      jobTypeId: data.jobTypeId || resolveJobTypeId(data.jobTypeHint),
      jobLevelId: data.jobLevelId || (levelMatch.confidence === 'high' ? levelMatch.id : null),
      jobRoleId: (data.jobRoleId !== undefined && data.jobRoleId !== null) ? data.jobRoleId : null,
      // BUG FIX: Industry was already provided (suggested or manually
      // picked) by the Employer in AI Create's Generate step -- must
      // already be selected in Step 2's Industry dropdown, not left blank
      // for them to re-pick. See easy-job-post-assistant-modal.component.ts
      // fillFromGenerated(), which now resolves this against the same live
      // options list this dropdown itself uses.
      industryId: (data.industryId !== undefined && data.industryId !== null) ? data.industryId : null,
    };

    this.setFormGroup(prefillData);

    // Populate FormArrays from extracted arrays
    if (data.requirements && data.requirements.length) {
      const reqArray = this.jobForm.get('initialData.requirements') as FormArray;
      data.requirements.forEach((item: string) => reqArray.push(new FormControl(item)));
    }
    if (data.goodToHave && data.goodToHave.length) {
      const gthArray = this.jobForm.get('initialData.goodToHave') as FormArray;
      data.goodToHave.forEach((item: string) => gthArray.push(new FormControl(item)));
    }
    if (data.skills && data.skills.length) {
      const skillsArray = this.jobForm.get('jobInfo.skills') as FormArray;
      data.skills.forEach((item: string) => skillsArray.push(new FormControl(item)));
    }
    if (data.interviewQuestions && data.interviewQuestions.length) {
      const iqArray = this.jobForm.get('interview.interviewQuestions') as FormArray;
      data.interviewQuestions.forEach((item: { question: string; answerDuration: number; retakes: number; sequence: number }) => {
        iqArray.push(this.fb.group({
          question: new FormControl(item.question),
          answerDuration: new FormControl(item.answerDuration),
          retakes: new FormControl(item.retakes),
          sequence: new FormControl(item.sequence),
        }));
      });
      this.questions = [...iqArray.value];
    }

    // Show a welcome snackbar. Job level is deliberately excluded here — it's either
    // already applied to the form above, or handled by its own confirmation nudge
    // (tryResolveJobLevelFromPendingHint) once the live level list resolves.
    const hints: string[] = [];
    if (data.jobTypeHint) hints.push(`Job type: ${data.jobTypeHint}`);
    if (data.workSetupHint) hints.push(`Work setup: ${data.workSetupHint}`);
    const hintText = hints.length ? ` Suggested: ${hints.join(' · ')}.` : '';
    this.snackbarService.success(
      `Job form prefilled from your import.${hintText} Please review and complete the required fields.`,
      '', 7000
    );

    // Level list may already be loaded (e.g. re-entering the assistant flow within
    // the same session) — attempt an immediate retry rather than waiting for the
    // next level$ emission, which only fires on change.
    this.tryResolveJobLevelFromPendingHint();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
  }

  onLoad(isLoading) {
    this.loading = isLoading;
  }

  getCompanyRestrictions(subs: Model.CompanySubscriptions) {
    if (subs.jobPost === subs.jobPostCount) {
      this.isAllowedToPublish = false;
    }
  }

  setFormGroup(data?: any) {
    this.jobForm = this.fb.group({
      initialData: this.fb.group({
        jobTitle: [data ? data.jobTitle : null, Validators.required],
        jobTypeId: [data ? data.jobTypeId : null],
        jobLevelId: [data ? data.jobLevelId : null],
        jobAddress: [data ? data.jobAddress : null],
        jobCity: [data ? data.jobCity : null, Validators.required],
        jobCountry: [data ? data.jobCountry : null, Validators.required],
        jobDescription: [data ? data.jobDescription : null],
        jobDuties: [data ? data.jobDuties : null],
        jobCategoryId: [data ? data.jobCategoryId : null],
        workSetupId: [data ? data.workSetupId : null],
        expirationDate: [data ? data.expirationDate : null],
        jobBanner: [data ? data.jobBanner : null],
        bannerFile: new FormArray([]),
        badges: new FormArray([]),
        requirements: new FormArray([]),
        goodToHave: new FormArray([]),
        educationalBackground: new FormArray([]),
        certificationRequirements: new FormArray([]),
        requirementsTxt: [null],
        goodToHaveTxt: [null],
        educationalBackgroundTxt: [null]
      }),
      jobInfo: this.fb.group({
        industryId: [data ? data.industryId : null],
        jobRoleId: [data ? data.jobRoleId : null],
        skills: new FormArray([]),
        jobSkillsTxt: [null],
        tags: new FormArray([]),
        jobTagsTxt: [null],
        rate: [data ? data.rate : null],
        salaryMinimum: [data ? data.salaryMinimum : null],
        salaryMaximum: [data ? data.salaryMaximum : null],
        salaryCurrency: [data ? data.salaryCurrency : null],
        // contractStart: DetailedDate;
        // contractEnd: DetailedDate;
      }),
      interview: this.fb.group({
        interviewQuestions: this.fb.array([]),
        interviewTemplateId: [data ? data.interviewTemplateId : null],
      })
    });

    // QA8 FIX-10: unsubscribe any previous statusChanges listeners before
    // creating new ones — prevents accumulation when editJob$ emits repeatedly.
    this.formSubs.unsubscribe();
    this.formSubs = new Subscription();

    this.formSubs.add(
      this.jobForm.controls.initialData.statusChanges
        .pipe(distinctUntilChanged())
        .subscribe((status) => {
          this.initialFormValid = status === 'VALID';
          this.stepperItems[1].disabled = status != 'VALID';
        })
    );

    this.formSubs.add(
      this.jobForm.controls.jobInfo.statusChanges
        .pipe(distinctUntilChanged())
        .subscribe((status) => {
          this.jobInfoValid = status === 'VALID';
          this.stepperItems[2].disabled = status != 'VALID';
          this.interviewValid = status === 'VALID';
          this.stepperItems[3].disabled = status != 'VALID';

        })
    );

    // B13: Job Readiness — recompute on any form value change, debounced 300ms.
    // companyId is sourced from local storage (set in ngOnInit).
    this.formSubs.add(
      this.jobForm.valueChanges
        .pipe(debounceTime(300))
        .subscribe(() => {
          const v = this.jobForm.value;
          this.readinessResult = this.jobReadiness.evaluate({
            ...v.initialData,
            ...v.jobInfo,
            interviewQuestions: v.interview && v.interview.interviewQuestions,
            companyId: this.companyId,
          });
          this.triggerFabPulse(this.readinessResult.readinessPercent);
          // Mark form as having unsaved changes (only when not currently saving)
          if (this.autoSaveState !== 'saving') {
            this.setAutoSaveState('unsaved');
          }
          // Schedule a background autosave — only in edit mode (jobId set) to
          // avoid creating a new draft record on every keystroke during creation.
          this.scheduleAutosave();
          this.cd.markForCheck();
        })
    );
    // Compute immediately so the bar shows on load
    const iv = this.jobForm.value;
    this.readinessResult = this.jobReadiness.evaluate({
      ...iv.initialData,
      ...iv.jobInfo,
      interviewQuestions: iv.interview && iv.interview.interviewQuestions,
      companyId: this.companyId,
    });

    // Made Interview Optional
    // this.subscriptions.add(
    //   this.jobForm.controls.interview.statusChanges
    //     .pipe(distinctUntilChanged())
    //     .subscribe((status) => {
    //       this.interviewValid = status === 'VALID';
    //       // this.stepperItems[3].disabled = status != 'VALID';
    //     })
    // );

    if (data) {
      //set form array
      let badges = this.jobForm.controls.initialData.get('badges') as FormArray;
      if (data.hasOwnProperty('badges') && data?.badges.length > 0) {
        data?.badges.forEach(element => {
          badges.push(
            new FormGroup({
              icon: new FormControl(element.icon),
              name: new FormControl(element.name),
              id: new FormControl(element.id)
            }));
        });
      }

      let goodToHave = this.jobForm.controls.initialData.get('goodToHave') as FormArray;
      if (data.hasOwnProperty('goodToHave') && data?.goodToHave.length > 0) {
        data?.goodToHave.forEach(element => {
          goodToHave.push(new FormControl(element));
        });
      }

      let requirements = this.jobForm.controls.initialData.get('requirements') as FormArray;
      if (data.hasOwnProperty('requirements') && data?.requirements.length > 0) {
        data.requirements.forEach(element => {
          requirements.push(new FormControl(element));
        })
      }

      let educationalBackground = this.jobForm.controls.initialData.get('educationalBackground') as FormArray;
      if (data.hasOwnProperty('educationalBackground') && data?.educationalBackground.length > 0) {
        data.educationalBackground.forEach(element => {
          educationalBackground.push(new FormControl(element));
        })
      }

      // GETHIRED JOB CERTIFICATION REQUIREMENTS v1 -- structured items,
      // so each is its own FormGroup (mirrors the badges pattern above),
      // not a plain FormControl<string> like requirements/goodToHave.
      let certificationRequirements = this.jobForm.controls.initialData.get('certificationRequirements') as FormArray;
      if (data.hasOwnProperty('certificationRequirements') && data?.certificationRequirements?.length > 0) {
        data.certificationRequirements.forEach(element => {
          certificationRequirements.push(new FormGroup({
            id: new FormControl(element.id),
            name: new FormControl(element.name, Validators.required),
            type: new FormControl(element.type || 'certification'),
            importance: new FormControl(element.importance || 'required'),
            issuingAuthority: new FormControl(element.issuingAuthority),
            expiryRequired: new FormControl(!!element.expiryRequired),
            verificationRequired: new FormControl(!!element.verificationRequired),
          }));
        })
      }

      let skills = this.jobForm.controls.jobInfo.get('skills') as FormArray;
      if (data.hasOwnProperty('skills') && data?.skills.length > 0) {
        data.skills.forEach(element => {
          skills.push(new FormControl(element));
        })
      }

      let tags = this.jobForm.controls.jobInfo.get('tags') as FormArray;
      if (data.hasOwnProperty('tags') && data?.tags.length > 0) {
        data.tags.forEach(element => {
          tags.push(new FormControl(element));
        })
      }

      let interviewQuestions = this.jobForm.controls.interview.get('interviewQuestions') as FormArray;
      if (data.hasOwnProperty('interviewQuestions') && data?.interviewQuestions.length > 0) {
        data.interviewQuestions.forEach((element: QuestionModel.InterviewQuestion) => {
          const interviewCtrl = this.fb.group({
            questionId: new FormControl(element.questionId),
            question: new FormControl(element.question),
            answerDuration: new FormControl(element.answerDuration),
            retakes: new FormControl(element?.retakes),
            sequence: new FormControl(element?.sequence),
          })
          interviewQuestions.push(interviewCtrl);
        });

        this.questions = [...interviewQuestions.value]
        this.cd.detectChanges();
      }
    }

    // this.initial$ = this.jobFacade.initial$
    //   .pipe().subscribe(this.setInitialForm.bind(this));

    // this.info$ = this.jobFacade.info$
    //   .pipe().subscribe(this.setJobInfo.bind(this));


  }

  getJobById() {
    this.jobFacade.getJobById(this.jobId);
  }

  async saveAsDraft() {
    // AI-CREATE-RACE FIX: persistAssistantDraft()'s background POST /job/create
    // (see its own header comment) is what assigns this.jobId for an
    // AI-prefilled job. Submitting before that resolves means formatJob()
    // sends jobId: null, and JobService.saveJob() takes the CREATE branch --
    // producing a second, duplicate job record instead of updating the one
    // already being autosaved. Block submission for the same window the
    // Publish button already gets, per the identical reasoning below.
    if (this.autoSaveState === 'saving' && this.assistantPrefilled && !this.jobId) {
      this.snackbarService.warning('Still setting up your job — try again in a moment.', '', 3000);
      return;
    }
    // F-08 UX: set draft-saving spinner, clear prior error before attempt
    this.savingDraft = true;
    this.saveErrorMsg = null;
    this.saveSuccessPulse = false;
    this.setAutoSaveState('saving');
    const job: Model.Job = this.formatJob(1);
    this.jobFacade.saveJob(job);
  }

  publishJobPost() {
    // AI-CREATE-RACE FIX: an AI-prefilled job's this.jobId is assigned
    // asynchronously by persistAssistantDraft()'s background save (see that
    // method's header comment -- its whole purpose is preventing a second
    // job record). Publishing before that resolves means formatJob() sends
    // jobId: null, so JobService.saveJob() takes the CREATE branch instead
    // of updating the job already being autosaved: a second, genuinely
    // Published job gets created (hence a real "is now live" success
    // dialog), while the original draft the employer had been editing is
    // left untouched at Draft status -- looking exactly like a broken
    // publish even though the publish itself succeeded, just against the
    // wrong record. Block submission until the background save resolves
    // (autoSaveState leaves 'saving') or this.jobId is otherwise known.
    if (this.autoSaveState === 'saving' && this.assistantPrefilled && !this.jobId) {
      this.snackbarService.warning('Still setting up your job — try again in a moment.', '', 3000);
      return;
    }
    // F-08 UX: clear prior error before each publish attempt
    this.saveErrorMsg = null;
    this.saveSuccessPulse = false;
    const job: Model.Job = this.formatJob(2);

    // B16: JobReadinessService is now the single source of truth for the publish
    // gate — re-evaluated here against the exact payload about to be submitted
    // (not the last 300ms-debounced valueChanges snapshot, which could disagree
    // with `job` if the employer edited a field in the last 300ms before clicking
    // Publish). This replaces a previously hand-rolled, drift-prone duplicate of
    // this same gate.
    // `job` is typed as Model.Job, where bannerFile is a single File — while
    // JobReadinessInput (matching the untyped jobForm.value shape used by the
    // debounced evaluate() call above) expects bannerFile as an array. Cast here
    // rather than changing either pre-existing type, consistent with how the
    // debounced call site already passes untyped form values.
    //
    // FREELANCE-READINESS FIX: `job.jobTypeId` at this point has already been
    // converted by formatJob() from FREELANCE_JOB_TYPE_SENTINEL ('freelance')
    // to `null` -- deliberately, since no backend job_type row exists for it
    // (see job-field-resolvers.ts). But JobReadinessService.evaluate()'s
    // hasJobType check is a plain `!!input.jobTypeId`, so that same `null`
    // makes Employment Type look unfilled here even though Freelance was
    // genuinely selected -- the Step 4 checklist (which reads the raw,
    // not-yet-nulled form value) shows it satisfied, so Publish rejecting it
    // looks like a flat contradiction. Evaluate readiness against the RAW,
    // pre-conversion jobTypeId so this one field's submission-time
    // sentinel-to-null mapping never leaks into the readiness gate.
    const rawJobTypeId = this.jobForm.controls.initialData.value.jobTypeId;
    this.readinessResult = this.jobReadiness.evaluate({ ...job, jobTypeId: rawJobTypeId, companyId: this.companyId } as any);
    this.isReadyToPublish = this.readinessResult.canPublish;

    if (this.isReadyToPublish) {
      this.jobFacade.saveJob(job);
    } else {
      this.haptics.warning();

      // Derive blocking fields from the freshly-evaluated readinessResult (always
      // in sync with the Step 4 checklist, since both read from the same source).
      const sectionStepMap: { [sid: string]: number } = {
        'section-job-title': 1, 'section-employment': 1, 'section-job-level': 1,
        'section-location': 1, 'section-description': 1, 'section-work-setup': 1,
        'section-banner': 1, 'section-company': 1,
        'section-duties': 2, 'section-skills': 2, 'section-requirements': 2,
        'section-interview': 3,
      };
      const fieldActions = this.readinessResult.blockingItems.map((f) => ({
        label: 'Fix: ' + f.label,
        value: 'fix:' + (sectionStepMap[f.sectionId] || 1) + ':' + f.sectionId,
        primary: false as boolean,
      }));
      fieldActions.push({ label: 'Close', value: 'close', primary: false });

      const blockDialog = this.dialog.open(UpdatedDialogComponent, {
        data: {
          icon: 'exclamation-circle',
          message: "Your job can't be published yet. Tap a field below to fix it:",
          actions: fieldActions,
        },
      });

      blockDialog.afterClosed().subscribe((action: string) => {
        if (!action || action === 'close') return;
        if (action.startsWith('fix:')) {
          const parts = action.split(':');
          const targetStep = parseInt(parts[1], 10);
          const sectionId = parts.slice(2).join(':');
          if (targetStep !== this.stepper) {
            this.changeStep(targetStep);
          }
          setTimeout(() => {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        }
      });
    }
  }

  formatJob(status) {
    const { initialData, jobInfo, interview } = this.jobForm.controls;
    const { interviewQuestions, interviewTemplateId } = interview.value;
    return {
      ...initialData.value,
      ...jobInfo.value,
      // FREELANCE_JOB_TYPE_SENTINEL is a frontend-only selection marker
      // (no gethired.job_type row exists for it) -- never send it to the
      // backend as a fabricated jobTypeId. See job-field-resolvers.ts.
      jobTypeId: initialData.value.jobTypeId === FREELANCE_JOB_TYPE_SENTINEL
        ? null
        : initialData.value.jobTypeId,
      badges: initialData.value
        ? this.formatBadgesGetId(initialData.value.badges)
        : [],
      interviewQuestions,
      interviewTemplateId,
      companyId: this.companyId,
      jobStatusId: status,
      jobId: this.jobId
    };
  }

  afterSubmit(event) {
    // F-08 UX: clear any pending loading/error state on backend success
    this.savingDraft = false;
    this.saveErrorMsg = null;
    if (event) {
      // Confirmed backend persistence succeeded. Only touch the AI Create
      // draft when THIS session actually originated from AI Create
      // (assistantPrefilled) -- a plain Start From Scratch post must never
      // touch that draft, since From Scratch is now fully independent of
      // it (see ngOnInit()).
      //
      // PRODUCT CHANGE (2026-08-20): once the job has a real, explicit
      // server persistence -- Save Draft ('asDraft') OR Post ('published')
      // -- the local AI Create recovery is no longer needed and is removed
      // immediately. The job is now reachable/editable through the normal
      // Jobs list like any other Draft/Published job.
      if (this.assistantPrefilled) {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user && user._id) {
          this.aiCreateDraft.clear(user._id);
        }
      }
      // Brief success pulse — clears automatically after 2s
      this.saveSuccessPulse = true;
      this.setAutoSaveState('saved');
      setTimeout(() => {
        this.saveSuccessPulse = false;
        this.setAutoSaveState('unsaved');
      }, 2000);
    }
    if (event == 'asDraft') {
      // SignalFrame Phase B: soft haptic pulse on Save Draft success (visual
      // success-pulse/autosave-state above is the required non-vibrate
      // equivalent and already fires unconditionally).
      this.haptics.success();
      const draft = this.dialog.open(UpdatedDialogComponent, {
        disableClose: true,
        data: 'Job successfully saved as Draft.',
      });

      draft
        .afterClosed()
        .pipe()
        .subscribe(() => this.router.navigate(['/recruiter/jobs/list'], { relativeTo: this.route }));


    } else if (event == 'published') {
      this.haptics.jobPublished();
      this.talentProofAnalytics.trackTalentProofViewed('publish_success', this.talentProof.isVerified());

      const resolveIdAndShow = (resolvedId: string | null) => {
        const initialCtrl = this.jobForm.get('initialData');
        const jobTitle = (initialCtrl && initialCtrl.get('jobTitle') && initialCtrl.get('jobTitle').value)
          ? initialCtrl.get('jobTitle').value
          : 'your job';
        const publicPath = resolvedId ? ('/jobs/details/' + resolvedId) : null;
        const absoluteUrl = publicPath
          ? (window.location.protocol + '//' + window.location.host + publicPath)
          : null;
        // Redirect to job list with ?published= so the list can show a success toast
        const jobListQueryParams = resolvedId ? { published: resolvedId } : {};

        // Reusable clipboard helper
        const copyToClipboard = (url: string) => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(url).catch(() => this.fallbackCopyToClipboard(url));
          } else {
            this.fallbackCopyToClipboard(url);
          }
          this.snackbarService.success('Public link copied!', '', 3000);
        };

        const actions: Array<{ label: string; value: string; primary?: boolean }> = [];
        if (absoluteUrl) {
          actions.push({ label: 'View live job', value: 'viewPublic', primary: true });
        }
        actions.push({ label: 'Go to Job Posts', value: 'goToList' });
        if (absoluteUrl) {
          actions.push({ label: 'Copy public link', value: 'copyLink' });
        }
        // JOB-POST-FLOW REFINEMENT (2026-08-20): a clearly text-labeled
        // Close action is mandatory on the success overlay -- the dialog is
        // opened with disableClose:true (no backdrop/ESC dismissal), so
        // without this the only way out was a semantically-loaded action
        // button. Falls through the same "any non-viewPublic action ->
        // job list" handling below, which already leaves the Employer in a
        // valid Jobs context.
        actions.push({ label: 'Close', value: 'close' });

        // copyLink is registered as a callback — it copies without closing the dialog
        // so the employer can also click "View live job" or "Go to Job Posts" after copying
        const callbacks: { [key: string]: () => void } = absoluteUrl
          ? { copyLink: () => copyToClipboard(absoluteUrl) }
          : {};

        const published = this.dialog.open(UpdatedDialogComponent, {
          disableClose: true,
          data: {
            message: '"' + jobTitle + '" is now live and ready to be discovered by ' + this.talentProof.getDisplayCopy('short') + '.',
            actions,
            callbacks,
          },
        });

        published.afterClosed().subscribe((action: string) => {
          if (action === 'viewPublic' && absoluteUrl) {
            // Open public job in new tab with safe openers; current tab → job list
            const tab = window.open(absoluteUrl, '_blank', 'noopener,noreferrer');
            if (!tab) {
              // Popup blocked — show a second dialog with a real clickable link + copy option
              const fallback = this.dialog.open(UpdatedDialogComponent, {
                disableClose: false,
                data: {
                  message: 'Your browser blocked the new tab. Open the live job using the link below.',
                  linkUrl: absoluteUrl,
                  linkText: 'Open live job →',
                  actions: [
                    { label: 'Copy public link', value: 'copyFallback' },
                    { label: 'Go to Job Posts', value: 'doneFallback' },
                  ],
                  callbacks: { copyFallback: () => copyToClipboard(absoluteUrl) },
                },
              });
              fallback.afterClosed().subscribe(() => {
                this.router.navigate(['/recruiter/jobs/list'], { queryParams: jobListQueryParams });
              });
              return; // navigate happens when fallback closes
            }
          }
          // All other closes (goToList, ESC/backdrop, undefined) → job list
          // copyLink is handled by callback and never closes the dialog, so never arrives here
          this.router.navigate(['/recruiter/jobs/list'], { queryParams: jobListQueryParams });
        });
      };

      if (this.jobId) {
        resolveIdAndShow(this.jobId);
      } else {
        this.jobFacade.jobDetails$.pipe(take(1)).subscribe(job => {
          resolveIdAndShow(job && job.jobId ? job.jobId : null);
        });
      }
    }

  }

  formatBadgesGetId(rawBadges) {
    if (rawBadges && rawBadges.length != 0) {
      return rawBadges.map((badge) => badge.id);
    } else {
      return [];
    }
  }

  cancel() {
    this.jobFacade.resetFormState();
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  /** B13: Scroll to a section anchor when the user clicks a readiness chip */
  onReadinessJumpToSection(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /** Step 4 publish checklist: navigate to the correct step and scroll to the section */
  onChecklistItemClick(item: JobReadinessSectionStatus): void {
    const sectionStepMap: { [sid: string]: number } = {
      'section-job-title': 1, 'section-employment': 1, 'section-job-level': 1,
      'section-location': 1, 'section-description': 1, 'section-work-setup': 1,
      'section-banner': 1, 'section-company': 1,
      'section-duties': 2, 'section-skills': 2, 'section-requirements': 2,
      'section-interview': 3,
    };
    const targetStep = sectionStepMap[item.sectionId] || 1;
    if (targetStep !== this.stepper) {
      this.changeStep(targetStep);
    }
    setTimeout(() => {
      const el = document.getElementById(item.sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }

  /** Toggle a readiness collapsible group in the right rail */
  toggleReadinessGroup(group: 'blocking' | 'recommended' | 'completed'): void {
    this.readinessGroupOpen[group] = !this.readinessGroupOpen[group];
  }

  /** Status chip: class based on job status and readiness */
  getStatusChipClass(): string {
    if (this.status === 2) return 'gh-jc-status-chip--published';
    if (this.readinessResult && this.readinessResult.canPublish) return 'gh-jc-status-chip--ready';
    if (this.readinessResult && this.readinessResult.blockingItems.length > 0) return 'gh-jc-status-chip--missing';
    return 'gh-jc-status-chip--draft';
  }

  getStatusChipIcon(): string {
    if (this.status === 2) return 'bi-check-circle-fill';
    if (this.readinessResult && this.readinessResult.canPublish) return 'bi-check-circle';
    if (this.readinessResult && this.readinessResult.blockingItems.length > 0) return 'bi-exclamation-circle';
    return 'bi-pencil';
  }

  getStatusChipLabel(): string {
    if (this.status === 2) return 'Published';
    if (this.readinessResult && this.readinessResult.canPublish) return 'Ready to publish';
    if (this.readinessResult && this.readinessResult.blockingItems.length > 0) return 'Missing required fields';
    return 'Draft';
  }

  /** Human-readable label for a readiness level */
  getReadinessLevelLabel(level: JobReadinessLevel): string {
    return this.jobReadiness.getLevelLabel(level);
  }

  // ── B09: Two-axis strength/readiness explainability ────────────────────────

  // ── SignalFrame Phase B: Command Canvas shell (presentational only) ────────
  /** Mission Bar Preview toggle — shows the existing preview-job-post-step in a drawer. */
  previewMode: boolean = false;
  /**
   * Intelligence Stack floating panel: hidden by default on every breakpoint,
   * opened via the glowing FAB (`gh-jc-intelligence-fab`) and rendered as a
   * draggable floating dialog rather than a permanently-docked rail /
   * tablet-only drawer. Replaces the old `intelligenceDrawerOpen` mechanism.
   */
  intelligencePanelOpen: boolean = false;
  /** Manual drag offset (px) applied on top of the panel's default anchored position. */
  intelligencePanelOffset = { x: 0, y: 0 };
  private dragOrigin = { x: 0, y: 0, offsetX: 0, offsetY: 0 };
  private isDraggingIntelligencePanel = false;
  /** Brief "notification" pulse on the FAB whenever readinessPercent actually changes. */
  fabPulse: boolean = false;
  private lastFabPercent: number | null = null;
  private fabPulseTimer: any;

  togglePreviewMode(): void {
    this.previewMode = !this.previewMode;
    if (this.previewMode) {
      this.haptics.selection();
    }
  }

  openIntelligencePanel(): void {
    this.intelligencePanelOpen = true;
    this.haptics.selection();
  }

  closeIntelligencePanel(): void {
    this.intelligencePanelOpen = false;
  }

  /** FAB stays visible at all times; clicking it toggles the floating panel open/closed. */
  toggleIntelligencePanel(): void {
    if (this.intelligencePanelOpen) {
      this.closeIntelligencePanel();
    } else {
      this.openIntelligencePanel();
    }
  }

  /** Called whenever a fresh readiness result is computed; pulses the FAB only on an actual change. */
  private triggerFabPulse(percent: number): void {
    if (this.lastFabPercent !== null && percent !== this.lastFabPercent) {
      this.fabPulse = true;
      clearTimeout(this.fabPulseTimer);
      this.fabPulseTimer = setTimeout(() => {
        this.fabPulse = false;
        this.cd.markForCheck();
      }, 900);
    }
    this.lastFabPercent = percent;
  }

  onIntelligencePanelDragStart(event: PointerEvent): void {
    if (event.button !== 0) return;
    this.isDraggingIntelligencePanel = true;
    this.dragOrigin = {
      x: event.clientX,
      y: event.clientY,
      offsetX: this.intelligencePanelOffset.x,
      offsetY: this.intelligencePanelOffset.y,
    };
    event.preventDefault();
  }

  @HostListener('window:pointermove', ['$event'])
  onIntelligencePanelDragMove(event: PointerEvent): void {
    if (!this.isDraggingIntelligencePanel) return;
    this.intelligencePanelOffset = {
      x: this.dragOrigin.offsetX + (event.clientX - this.dragOrigin.x),
      y: this.dragOrigin.offsetY + (event.clientY - this.dragOrigin.y),
    };
  }

  @HostListener('window:pointerup')
  @HostListener('window:pointercancel')
  onIntelligencePanelDragEnd(): void {
    this.isDraggingIntelligencePanel = false;
  }

  /** Disclosure open/close state for the "What this means" panel */
  whatMeansOpen = false;

  toggleWhatMeans(): void {
    this.whatMeansOpen = !this.whatMeansOpen;
  }

  /** Strength chip label for the quality axis */
  getStrengthLabel(): string {
    if (!this.readinessResult) return '';
    switch (this.readinessResult.readinessLevel) {
      case 'basic':     return 'Needs improvement';
      case 'strong':    return 'Strong';
      case 'excellent': return 'Excellent';
      default:          return '';
    }
  }

  getStrengthChipClass(): string {
    if (!this.readinessResult) return '';
    switch (this.readinessResult.readinessLevel) {
      case 'basic':     return 'gh-jc-strength-chip--needs-improvement';
      case 'strong':    return 'gh-jc-strength-chip--strong';
      case 'excellent': return 'gh-jc-strength-chip--excellent';
      default:          return '';
    }
  }

  getStrengthIcon(): string {
    if (!this.readinessResult) return 'bi-circle';
    switch (this.readinessResult.readinessLevel) {
      case 'basic':     return 'bi-arrow-up-circle';
      case 'strong':    return 'bi-star';
      case 'excellent': return 'bi-star-fill';
      default:          return 'bi-circle';
    }
  }

  /** Inline next-step guidance below the chips */
  getStrengthGuidance(): string {
    if (!this.readinessResult) return '';
    const r = this.readinessResult;
    if (!r.canPublish) {
      return 'Complete the required fields to publish. Then add recommended details to improve post strength.';
    }
    const remaining = r.recommendationItems.length;
    switch (r.readinessLevel) {
      case 'basic': {
        const toStrong = Math.max(0, 3 - r.recommendedComplete);
        if (toStrong <= 0 || remaining === 0) return 'Ready to publish.';
        return 'Ready to publish. Add ' + toStrong + ' improvement' + (toStrong !== 1 ? 's' : '') + ' to reach Strong.';
      }
      case 'strong':
        if (remaining === 0) return 'Strong post.';
        return 'Strong post. Add ' + remaining + ' improvement' + (remaining !== 1 ? 's' : '') + ' to reach Excellent.';
      case 'excellent':
        return 'Excellent post. Your post includes the key details candidates need.';
      default:
        return '';
    }
  }

  /** Visually labelled improvement count for the recommended-items toggle */
  getImprovementCountLabel(): string {
    if (!this.readinessResult) return '';
    const r = this.readinessResult;
    const count = r.recommendationItems.length;
    if (count === 0) return 'All recommended details added';
    switch (r.readinessLevel) {
      case 'basic': {
        const toStrong = Math.max(0, 3 - r.recommendedComplete);
        if (toStrong > 0 && toStrong <= count) return toStrong + ' to Strong';
        return count + ' improvement' + (count !== 1 ? 's' : '');
      }
      case 'strong':
        return count + ' to Excellent';
      default:
        return count + ' improvement' + (count !== 1 ? 's' : '');
    }
  }

  /** Scroll to a field with error (used by error summary chips) */
  scrollToError(fieldId: string): void {
    const el = document.getElementById(fieldId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const input = el.querySelector('input, select, textarea') as HTMLElement;
      if (input) input.focus();
    }
  }

  /** Called when the user clicks Next — validates current step before advancing */
  onNextStep(): void {
    this.showStepErrors = false;
    this.stepErrorSummary = [];
    const nextStep = this.stepper + 1;

    if (this.stepper === 1 && !this.initialFormValid) {
      this.jobForm.controls['initialData'].markAllAsTouched();
      this.buildStepErrorSummary('initialData');
      this.haptics.warning();
      this.openStepErrorDialog();
      return;
    }
    if (this.stepper === 2 && !this.jobInfoValid) {
      this.jobForm.controls['jobInfo'].markAllAsTouched();
      this.buildStepErrorSummary('jobInfo');
      this.haptics.warning();
      this.openStepErrorDialog();
      return;
    }
    if (this.stepper === 3 && this.createInterviewRef && this.createInterviewRef.hasPendingQuestion()) {
      this.haptics.warning();
      const guardDialog = this.dialog.open(UpdatedDialogComponent, {
        data: {
          icon: 'exclamation-circle',
          message: 'You have an unsaved question. Click "Add" to save it first, or continue without it.',
          actions: [
            { label: 'Keep editing', value: 'close', primary: true },
            { label: 'Continue without adding', value: 'continue', primary: false },
          ],
        },
      });
      guardDialog.afterClosed().subscribe((action: string) => {
        if (action === 'continue') {
          this.changeStep(nextStep);
        }
      });
      return;
    }
    // Simplified mode: Step 3 (Screening & Interview) is hidden entirely --
    // skip straight from Step 2 to Step 4 rather than landing on a step the
    // Employer can't see. Interview fields stay empty/default, same as any
    // other optional field never touched in Simplified mode. Done by hand
    // (not changeStep(4)) so the Step-2 (jobInfo) data actually being left
    // still gets saved -- changeStep()'s index lookup assumes the step being
    // left is always (target - 1), which isn't true for this skip.
    if (this.stepper === 2 && this.isSimplified) {
      const bodyInfo = this.jobForm.controls['jobInfo'].value;
      this.jobFacade.saveJobInfo(bodyInfo);
      this.stepper = 4;
      this.jobFacade.getIndustry();
      this.jobFacade.getJobRole();
      return;
    }
    this.changeStep(nextStep);
  }

  /** Mirror of onNextStep()'s Step-3 skip, for the Back button in Simplified mode. */
  onBackStep(): void {
    if (this.stepper === 4 && this.isSimplified) {
      this.stepper = 2;
      return;
    }
    this.changeStep(this.stepper - 1);
  }

  /** Show a dialog listing missing required fields; clicking a field scrolls to it in the current step. */
  private openStepErrorDialog(): void {
    const actions = this.stepErrorSummary.map(e => ({
      label: e.label,
      value: 'scroll:' + e.fieldId,
      primary: false as boolean,
    }));
    actions.push({ label: 'Continue editing', value: 'close', primary: false });

    const errDialog = this.dialog.open(UpdatedDialogComponent, {
      data: {
        message: 'Please fill in the required fields to continue:',
        actions,
      },
    });

    errDialog.afterClosed().subscribe((action: string) => {
      if (!action || action === 'close') return;
      if (action.startsWith('scroll:')) {
        const sectionId = action.slice('scroll:'.length);
        this.showStepErrors = true;
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
  }

  /** Clipboard fallback for browsers without navigator.clipboard */
  private fallbackCopyToClipboard(text: string): void {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  private buildStepErrorSummary(formGroupName: string): void {
    const group = this.jobForm.controls[formGroupName] as FormGroup;
    if (!group) return;
    const labelMap: { [key: string]: { label: string; sectionId: string } } = {
      jobTitle: { label: 'Job title is required', sectionId: 'section-job-title' },
      jobCity: { label: 'City is required', sectionId: 'section-location' },
      jobCountry: { label: 'Country is required', sectionId: 'section-location' },
    };
    Object.keys(group.controls).forEach(key => {
      const ctrl = group.controls[key];
      if (ctrl.invalid && labelMap[key]) {
        this.stepErrorSummary.push({
          fieldId: labelMap[key].sectionId,
          label: labelMap[key].label
        });
      }
    });
  }

  /**
   * Schedules a background autosave 2 seconds after the last form change.
   * Only fires when jobId is already known (edit mode). New-job drafts must
   * be saved manually first so we don't create a new record on every keystroke.
   */
  private scheduleAutosave(): void {
    if (!this.jobId) return;
    if (this.autosaveTimerId) clearTimeout(this.autosaveTimerId);
    this.autosaveTimerId = setTimeout(() => this.performAutosave(), 2000);
  }

  /** Executes the background draft save via JobService (not NgRx store) to
   *  avoid triggering the editJob$ → setFormGroup() form-reset side effect. */
  private performAutosave(): void {
    if (!this.jobId || this.autoSaveState === 'saving') return;
    // AUTOSAVE-STATUS-REGRESSION FIX: this used to hardcode formatJob(1)
    // (Draft) unconditionally. A debounced autosave scheduled just before a
    // genuine Publish click can have its request land AFTER the publish
    // request completes -- silently overwriting job_status_id back to 1 on
    // the same row, with no visible error (this call deliberately bypasses
    // the NgRx facade/success$ flow, see this method's own doc comment, so
    // nothing surfaces to the user). The employer would see a real "is now
    // live" success dialog immediately followed by an invisible reversion
    // back to Draft. Preserve whatever the job's actual current status is
    // (already tracked in this.status, kept in sync by editJob$ after every
    // facade-routed save including Publish) instead of forcing Draft --
    // autosave should never change a job's publish state, only its content.
    const job = this.formatJob(this.status || 1);
    this.setAutoSaveState('saving');
    this.jobService.saveJob(job).pipe(take(1)).subscribe({
      next: () => {
        this.setAutoSaveState('saved');
        setTimeout(() => {
          if (this.autoSaveState === 'saved') this.setAutoSaveState('unsaved');
        }, 3000);
      },
      error: () => {
        this.setAutoSaveState('failed');
      },
    });
  }

  /** Update autosave indicator state */
  private setAutoSaveState(state: 'unsaved' | 'saving' | 'saved' | 'failed'): void {
    this.autoSaveState = state;
    this.cd.markForCheck();
  }

  /**
   * Persists an AI-assistant-prefilled job as a real private draft the moment the
   * employer commits to it, instead of waiting for edit-mode autosave to kick in
   * (which never would, since scheduleAutosave() requires jobId to already exist).
   * Calls JobService directly (bypassing the NgRx facade), mirroring performAutosave()
   * above, so the success response doesn't route through editJob$ and re-run
   * setFormGroup() on top of the form the assistant just populated.
   */
  private persistAssistantDraft(job: Model.Job): void {
    this.setAutoSaveState('saving');
    this.jobService.saveJob(job).pipe(take(1)).subscribe({
      next: (res: any) => {
        const newId = res && res.data && res.data.jobId;
        if (newId) {
          // The one assignment that activates edit-mode autosave for the rest of
          // this session, and routes future formatJob() saves through PUT
          // /updatejobs instead of creating a second job record.
          this.jobId = newId;
          this.setAutoSaveState('saved');
          // This background save already creates a real Draft-status job
          // server-side -- the local AI Create recovery is redundant the
          // moment that exists (the job is now reachable/editable through
          // the normal Jobs list, same as a job explicitly Saved as Draft).
          if (this.assistantPrefilled) {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (user && user._id) {
              this.aiCreateDraft.clear(user._id);
            }
          }
        } else {
          this.setAutoSaveState('unsaved');
        }
      },
      error: () => {
        // Never block the manual wizard path — the employer can still complete
        // and save/publish normally even if this background save failed.
        this.setAutoSaveState('failed');
        this.snackbarService.error(
          "Couldn't auto-save your AI draft. Your data is still here — save manually when ready.",
          '', 5000
        );
      },
    });
  }

  /**
   * Retries job-level resolution once the live level list arrives, in case it
   * loaded after the AI assistant data was applied. Nudges the employer exactly
   * once if a hint existed but never confidently resolved.
   */
  private tryResolveJobLevelFromPendingHint(): void {
    if (!this.jobLevelHintPending || !this.latestLevels.length) return;
    const current = this.jobForm?.get('initialData.jobLevelId')?.value;
    if (current) {
      // Already set (either resolved earlier or picked manually) — nothing to do.
      this.jobLevelHintPending = null;
      return;
    }
    const match = resolveJobLevelId(this.jobLevelHintPending, this.latestLevels);
    if (match.confidence === 'high' && match.id) {
      this.jobForm.get('initialData.jobLevelId').setValue(match.id);
      this.jobLevelHintPending = null;
      return;
    }
    this.jobLevelHintPending = null;
    if (this.jobLevelConfirmationShown) return;
    this.jobLevelConfirmationShown = true;
    // Not an error: AI Create deliberately leaves ambiguous fields for the
    // Employer to finish, rather than guessing. Styled as success (green),
    // not a failure state -- this is the expected next step, not a problem.
    this.snackbarService.success(
      "Almost there — add the Experience Level below. You're finishing this job post, so add anything else it needs before you publish.",
      '', 6000
    );
    if (this.stepper === 1) {
      setTimeout(() => {
        const el = document.getElementById('section-job-level');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }

  changeStep(event) {
    this.stepper = event;
    const formCtrl = this.stepperItems[event - 2]?.formName;

    if (event == 4) {
      this.jobFacade.getIndustry();
      this.jobFacade.getJobRole();
    }

    switch (formCtrl) {
      case 'initialData':
        const bodyInitial = this.jobForm.controls[formCtrl].value;
        this.jobFacade.saveInitialForm(bodyInitial);
        break;
      case 'jobInfo':
        const bodyInfo = this.jobForm.controls[formCtrl].value;
        this.jobFacade.saveJobInfo(bodyInfo);
        break;
      case 'interview':
        const bodyInterview = this.jobForm.controls[formCtrl].value;
        this.jobFacade.saveInterview(bodyInterview.interviewQuestions, bodyInterview.interviewTemplateId)
        break;
    }
  }

  restrictJobCreation(restriction) {
    let openChecker = this.dialog.open(
      SubscriptionAlertComponent,
      {
        width: 'min(560px, 95vw)',
        data: {
          isError: restriction
        }
      }
    );

    this.subscriptions.add(
      openChecker
        .afterClosed()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(result => {
          if (result == 1) {
            this.router.navigate(['../../subscription'], { relativeTo: this.route })
          }
        })
    );
  }

  ngOnDestroy() {
    this.jobFacade.resetFormState();
    this.subscriptions.unsubscribe();
    this.formSubs.unsubscribe(); // QA8 FIX-10: clean up form-status subscriptions
    if (this.autosaveTimerId) clearTimeout(this.autosaveTimerId);
    if (this.fabPulseTimer) clearTimeout(this.fabPulseTimer);
  }
}
