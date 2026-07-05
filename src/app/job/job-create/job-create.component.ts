import { Component, OnDestroy, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
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
import { JobReadinessService, JobReadinessResult, JobReadinessLevel } from '../services/job-readiness.service';
import { EasyJobPostAssistantService } from '../easy-job-post-assistant/easy-job-post-assistant.service';
import { JobService } from '../job.service';

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
  ) {
    this.route.queryParams.subscribe(params => {
      this.jobId = params.id;
    });
  }

  ngOnInit(): void {
    this.asyncLocalStorage.getItem('user')
      .then(user => {
        this.companyId = JSON.parse(user).companyId;
        this.jobFacade.getCompanySubscription(this.companyId);
      });

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
      } else {
        this.setFormGroup();
      }
    }
  }

  private resolveWorkSetupId(hint: string | null): number | null {
    if (!hint) return null;
    const h = hint.toLowerCase().trim();
    if (h.includes('remote') || h === 'wfh' || h.includes('work from home')) return 2;
    if (h.includes('hybrid')) return 3;
    if (h.includes('onsite') || h.includes('on-site') || h.includes('on site') || h.includes('office')) return 1;
    return null;
  }

  private resolveJobTypeId(hint: string | null): number | null {
    if (!hint) return null;
    const h = hint.toLowerCase().trim();
    if (h.includes('full') && h.includes('time')) return 1;
    if (h.includes('part') && h.includes('time')) return 2;
    if (h.includes('contract')) return 3;
    if (h.includes('intern')) return 4;
    if (h.includes('freelance')) return 5;
    return null;
  }

  applyAssistantPrefill(data: any): void {
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
      workSetupId: data.workSetupId || this.resolveWorkSetupId(data.workSetupHint),
      jobTypeId: data.jobTypeId || this.resolveJobTypeId(data.jobTypeHint),
      jobRoleId: (data.jobRoleId !== undefined && data.jobRoleId !== null) ? data.jobRoleId : null,
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

    // Show a welcome snackbar
    const hints: string[] = [];
    if (data.jobTypeHint) hints.push(`Job type: ${data.jobTypeHint}`);
    if (data.jobLevelHint) hints.push(`Level: ${data.jobLevelHint}`);
    if (data.workSetupHint) hints.push(`Work setup: ${data.workSetupHint}`);
    const hintText = hints.length ? ` Suggested: ${hints.join(' · ')}.` : '';
    this.snackbarService.success(
      `Job form prefilled from your import.${hintText} Please review and complete the required fields.`,
      '', 7000
    );
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
    // F-08 UX: set draft-saving spinner, clear prior error before attempt
    this.savingDraft = true;
    this.saveErrorMsg = null;
    this.saveSuccessPulse = false;
    this.setAutoSaveState('saving');
    const job: Model.Job = this.formatJob(1);
    this.jobFacade.saveJob(job);
  }

  publishJobPost() {
    // F-08 UX: clear prior error before each publish attempt
    this.saveErrorMsg = null;
    this.saveSuccessPulse = false;
    const job: Model.Job = this.formatJob(2);

    // null != "" is always true in JS — must check explicitly for null/empty banner
    const hasBanner = !!(
      (job.bannerFile && job.bannerFile[0]) ||
      (job.jobBanner && job.jobBanner.trim())
    );

    // B04 V5: Interview questions are now optional for publish.
    this.isReadyToPublish = !!(
      job.jobTypeId &&
      job.jobLevelId &&
      job.jobCity != null && job.jobCity !== '' &&
      job.jobCountry != null && job.jobCountry !== '' &&
      job.jobDescription != null && job.jobDescription !== '' &&
      job.workSetupId &&
      hasBanner &&
      job.companyId
    );

    if (this.isReadyToPublish) {
      this.jobFacade.saveJob(job);
    } else {
      // Build missing-field list with step + section mapping so the dialog can navigate
      const missingFields: Array<{ label: string; step: number; sectionId: string }> = [];

      if (!job.jobTypeId) {
        missingFields.push({ label: 'Employment type', step: 1, sectionId: 'section-employment' });
      }
      if (!job.jobLevelId) {
        missingFields.push({ label: 'Job level', step: 1, sectionId: 'section-job-level' });
      }
      if (!job.jobCity) {
        missingFields.push({ label: 'City', step: 1, sectionId: 'section-location' });
      }
      if (!job.jobCountry) {
        missingFields.push({ label: 'Country', step: 1, sectionId: 'section-location' });
      }
      if (!job.jobDescription) {
        missingFields.push({ label: 'Job description', step: 2, sectionId: 'section-description' });
      }
      if (!job.workSetupId) {
        missingFields.push({ label: 'Work setup', step: 1, sectionId: 'section-work-setup' });
      }
      if (!hasBanner) {
        missingFields.push({ label: 'Banner image', step: 1, sectionId: 'section-banner' });
      }
      if (!job.companyId) {
        missingFields.push({ label: 'Company profile', step: 1, sectionId: 'section-company' });
      }

      this.haptics.warning();

      const fieldActions = missingFields.map(f => ({
        label: 'Fix: ' + f.label,
        value: 'fix:' + f.step + ':' + f.sectionId,
        primary: false as boolean,
      }));
      fieldActions.push({ label: 'Close', value: 'close', primary: false });

      const blockDialog = this.dialog.open(UpdatedDialogComponent, {
        data: {
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
      // Brief success pulse — clears automatically after 2s
      this.saveSuccessPulse = true;
      this.setAutoSaveState('saved');
      setTimeout(() => {
        this.saveSuccessPulse = false;
        this.setAutoSaveState('unsaved');
      }, 2000);
    }
    if (event == 'asDraft') {
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
    this.changeStep(nextStep);
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
    const job = this.formatJob(1);
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
  }
}
