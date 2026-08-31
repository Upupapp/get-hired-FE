import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';

const fadeSlide = trigger('fadeSlide', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(6px)' }),
    animate('180ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);
import { isPlatformBrowser } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EasyJobPostAssistantService } from '../easy-job-post-assistant.service';
import { AssistantExtractionResult, AssistantStep, GenerateIntentInputs, InstantJobDraft, ReviewFlag } from '../easy-job-post-assistant.models';
import { HapticFeedbackService } from '@main/shared/services/haptic-feedback/haptic-feedback.service';
import { AiCreateDraftService } from '@app-job/services/ai-create-draft.service';
import { JobService } from '@app-job/job.service';
import { JobFacade } from '@app-job/state/job.facade';
import * as Model from '@app-job/job.model';
import { Options } from '@app-job/job.model';
import { suggestIndustryName, matchSuggestedIndustry } from '@app-job/utils/job-industry-suggester';
import { JobPostModeDialogComponent, JobPostMode } from '@app-job/job-create/components/job-post-mode-dialog/job-post-mode-dialog.component';
import { resolveJobLevelId, LevelOption } from '@app-job/utils/job-level-resolver';
import { resolveWorkSetupId, resolveJobTypeId, FREELANCE_JOB_TYPE_SENTINEL } from '@app-job/utils/job-field-resolvers';
import { SnackbarService } from '@app-core/services/snackbar.service';

@Component({
  selector: 'app-easy-job-post-assistant-modal',
  templateUrl: './easy-job-post-assistant-modal.component.html',
  styleUrls: ['./easy-job-post-assistant-modal.component.scss'],
  animations: [fadeSlide],
})
export class EasyJobPostAssistantModalComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

  step: AssistantStep = 'choose';
  loading: boolean = false;
  dragOver: boolean = false;
  errorMsg: string | null = null;

  // Upload state
  selectedFile: File | null = null;

  // Link state
  linkUrl: string = '';
  linkUrlError: string | null = null;

  // Extraction result (upload/link flow)
  extractionResult: AssistantExtractionResult | null = null;
  extractionSource: string | null = null;

  // Generate flow (V4)
  generateInputs: GenerateIntentInputs = {
    jobTitle: '',
    location: '',
    workSetup: '',
    employmentType: '',
    industry: '',
  };
  generateErrors: { jobTitle?: string } = {};
  generatedDraft: InstantJobDraft | null = null;
  generatedJobRoleId: number | null = null;
  // BUG #2 FIX: "Post this job" fast path -- lets the employer publish the
  // AI-generated draft directly from this modal instead of being forced
  // through the full manual job-create stepper. Purely additive: fillFromGenerated()
  // (the pre-existing "Use this draft" -> manual form handoff) is untouched.
  postingNow: boolean = false;

  // GETHIRED_EMPLOYER_AI_CREATE_PERSISTENT_UNFINISHED_JOB_DRAFT_FLOW_SINGLE_COMMAND_V2:
  // this modal's Generate step IS "AI Create" -- the sole persistent
  // unfinished-job workspace. Start From Scratch (chooseManual(), below)
  // deliberately never touches any of this.
  industryOptions: Options[] = [];
  // DRAFT-SAVE FIX: was a hardcoded list including "Freelance", which has no
  // matching gethired.job_type row (only Full time/Part time/Contractor are
  // seeded) -- selecting it made the background persistAssistantDraft() save
  // fail an FK constraint. Now sourced from the same live endpoint the
  // canonical "Create a Job / From Scratch" form uses, same as industryOptions.
  employmentTypeOptions: Options[] = [];
  industrySuggested: boolean = false;
  draftRestored: boolean = false;
  // TAB 18: set when a `storage` event reports another tab/window wrote a
  // newer copy of THIS owner's draft. Autosave stops silently overwriting
  // it while true -- the Employer must explicitly Reload (take the other
  // tab's version) or Keep Editing Here (resume autosaving their own).
  externalUpdateDetected: boolean = false;
  private ownerScope: string | null = null;
  private autosaveTimerId: any = null;
  private generationRequestSeq = 0;
  private storageListenerBound = false;

  private destroy$ = new Subject<void>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EasyJobPostAssistantModalComponent>,
    private dialog: MatDialog,
    private assistantService: EasyJobPostAssistantService,
    private router: Router,
    private haptics: HapticFeedbackService,
    private aiCreateDraft: AiCreateDraftService,
    private jobService: JobService,
    private jobFacade: JobFacade,
    private snackbarService: SnackbarService,
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.ownerScope = user && user._id;

    // TAB 18: cross-tab conflict detection. `storage` events only fire in
    // OTHER tabs/windows of the same origin, never the tab that made the
    // write -- so any event for this exact key is, by construction, an
    // external change, no extra bookkeeping needed to tell them apart.
    if (this.ownerScope && isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', this.onStorageEvent);
      this.storageListenerBound = true;
    }

    this.jobService.getIndustryList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => { this.industryOptions = (res && res.data) || res || []; },
      error: () => { /* non-fatal -- Industry select just stays empty */ },
    });

    this.jobService.getTypeList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => { this.employmentTypeOptions = (res && res.data) || res || []; },
      error: () => { /* non-fatal -- Employment type select just stays empty */ },
    });

    // A saved AI Create draft represents real unfinished work and takes
    // priority over the generic company-context defaults below (Phase 15/19).
    const draft = this.ownerScope ? this.aiCreateDraft.load(this.ownerScope) : null;
    if (draft) {
      this.generateInputs = { ...this.generateInputs, ...draft.input };
      this.draftRestored = true;
      this.step = 'generate';
      if (!this.generateInputs.industry) {
        this.trySuggestIndustry();
      }
      return;
    }

    if (this.data) {
      if (this.data.companyCity) {
        this.generateInputs.location = this.data.companyCity;
      }
      if (this.data.companyIndustryName) {
        this.generateInputs.industry = this.data.companyIndustryName;
      }
      if (this.data.workSetupId) {
        const wsNames: { [key: number]: string } = { 1: 'Onsite', 2: 'Remote', 3: 'Hybrid' };
        this.generateInputs.workSetup = wsNames[this.data.workSetupId] || '';
      }
    }
  }

  ngOnDestroy(): void {
    if (this.autosaveTimerId) clearTimeout(this.autosaveTimerId);
    if (this.storageListenerBound) {
      window.removeEventListener('storage', this.onStorageEvent);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- AI Create draft persistence (autosave) -----------------------------

  /** TAB 18: another tab/window wrote a newer copy of this owner's draft.
   *  Bound as a class property (not a method) so the same reference can be
   *  removed in ngOnDestroy(). Does not touch the current in-memory form --
   *  only surfaces the warning banner; see reloadFromOtherTab()/
   *  keepEditingHere() for the two explicit resolutions (no auto-merge). */
  private onStorageEvent = (e: StorageEvent): void => {
    if (!this.ownerScope) return;
    if (e.key !== this.aiCreateDraft.getStorageKeyFor(this.ownerScope)) return;
    this.externalUpdateDetected = true;
  };

  /** Take the other tab's version -- discards this tab's in-memory edits. */
  reloadFromOtherTab(): void {
    if (!this.ownerScope) return;
    const draft = this.aiCreateDraft.load(this.ownerScope);
    if (draft) {
      this.generateInputs = { ...this.generateInputs, ...draft.input };
      if (!this.generateInputs.industry) {
        this.trySuggestIndustry();
      }
    }
    this.externalUpdateDetected = false;
    this.haptics.selection();
  }

  /** Keep working in THIS tab -- dismisses the warning; the next autosave
   *  resumes writing normally (this tab's version will then overwrite the
   *  other tab's, an explicit Employer choice, not a silent one). */
  keepEditingHere(): void {
    this.externalUpdateDetected = false;
    this.haptics.selection();
  }

  /** Debounced autosave -- called from (ngModelChange) on every Generate-step
   *  field. Short debounce, not a write on every keystroke synchronously. */
  scheduleAutosave(): void {
    if (!this.ownerScope) return;
    if (this.autosaveTimerId) clearTimeout(this.autosaveTimerId);
    this.autosaveTimerId = setTimeout(() => {
      // Don't persist a draft with no title at all -- nothing meaningful to resume.
      if (!this.generateInputs.jobTitle || !this.generateInputs.jobTitle.trim()) return;
      // TAB 18: don't silently overwrite a newer external write while the
      // conflict banner is showing -- the Employer must explicitly resolve
      // it first (reject stale autosave writes where practical).
      if (this.externalUpdateDetected) return;
      this.aiCreateDraft.save(this.generateInputs, this.ownerScope, 'easy-job-post-assistant-modal', 'editing');
    }, 800);
  }

  /** Job-title-specific handler: autosave, plus (only when the Employer
   *  hasn't already picked an Industry themselves) a conservative,
   *  editable suggestion -- never invented, never auto-applied to
   *  generation. See job-industry-suggester.ts. */
  onJobTitleChanged(): void {
    if (!this.generateInputs.industry) {
      this.trySuggestIndustry();
    }
    this.scheduleAutosave();
  }

  /** Explicit user change to Industry (the suggestion is no longer "just a
   *  suggestion" once they've touched it, even if they happen to pick the
   *  same value back). */
  onIndustryChanged(): void {
    this.industrySuggested = false;
    this.scheduleAutosave();
  }

  private trySuggestIndustry(): void {
    const suggestedName = suggestIndustryName(this.generateInputs.jobTitle);
    if (!suggestedName) return;
    const match = matchSuggestedIndustry(suggestedName, this.industryOptions);
    if (match) {
      this.generateInputs.industry = match.name;
      this.industrySuggested = true;
    }
    // No match against the live options (or no reliable inference at all) --
    // leave Industry empty/selectable. Never fabricate a value.
  }

  /** Explicit discard -- the only other way (besides confirmed job
   *  persistence) the AI Create draft is allowed to be cleared. */
  discardDraft(): void {
    if (!this.ownerScope) return;
    this.haptics.selection();
    // Invalidate any Generate request still in flight -- see runGenerate() --
    // so a late response can't repopulate the draft the user just discarded.
    this.generationRequestSeq++;
    this.loading = false;
    this.aiCreateDraft.clear(this.ownerScope);
    this.draftRestored = false;
    this.industrySuggested = false;
    this.generatedDraft = null;
    this.generateInputs = { jobTitle: '', location: '', workSetup: '', employmentType: '', industry: '' };
  }

  // --- Screen navigation ---

  chooseUpload(): void {
    this.haptics.selection();
    this.step = 'upload';
    this.errorMsg = null;
  }

  chooseLink(): void {
    this.haptics.selection();
    this.step = 'link';
    this.errorMsg = null;
  }

  chooseManual(): void {
    this.haptics.selection();
    // Comprehensive/Simplified job-post mode picker: opened on top of this
    // modal rather than navigating immediately. If the Employer dismisses it
    // (backdrop click / Escape) `mode` comes back undefined and we stay put
    // -- no navigation, no clearing of the assistant's extraction result.
    const modeDialogRef = this.dialog.open(JobPostModeDialogComponent, {
      panelClass: 'gh-pmd-panel',
      autoFocus: false,
      restoreFocus: true,
    });
    modeDialogRef.afterClosed().subscribe((mode: JobPostMode | undefined) => {
      if (!mode) return;
      this.haptics.selection();
      this.assistantService.clearExtractionResult();
      const queryParams = mode === 'simplified' ? { postMode: 'simplified' } : undefined;
      this.dialogRef.close({ navigateTo: '/recruiter/jobs/create', postMode: mode });
      this.router.navigate(['/recruiter/jobs/create'], queryParams ? { queryParams } : undefined);
    });
  }

  chooseGenerate(): void {
    this.haptics.selection();
    this.step = 'generate';
    this.errorMsg = null;
  }

  backToChoose(): void {
    this.step = 'choose';
    this.errorMsg = null;
    this.selectedFile = null;
    this.linkUrl = '';
    this.linkUrlError = null;
    this.loading = false;
  }

  // --- File upload ---

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(): void {
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    const files = event.dataTransfer && event.dataTransfer.files;
    if (files && files.length > 0) {
      this.selectFile(files[0]);
    }
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectFile(input.files[0]);
    }
  }

  triggerFileInput(): void {
    if (isPlatformBrowser(this.platformId) && this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  private selectFile(file: File): void {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/rtf', 'application/rtf'];
    const allowedExt = /\.(pdf|doc|docx|txt|rtf)$/i;

    if (!allowedExt.test(file.name)) {
      this.errorMsg = 'Unsupported file type. Please upload a PDF, DOC, DOCX, TXT, or RTF file.';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorMsg = 'File is too large. Maximum size is 10MB.';
      return;
    }
    this.errorMsg = null;
    this.selectedFile = file;
    this.haptics.selection();
  }

  uploadFile(): void {
    if (!this.selectedFile || this.loading) return;
    this.loading = true;
    this.errorMsg = null;

    this.assistantService.uploadAndExtract(this.selectedFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.haptics.uploadComplete();
          this.extractionResult = res.extractedFields;
          this.extractionSource = res.filename;
          this.step = 'review';
        },
        error: (err) => {
          this.loading = false;
          this.haptics.error();
          if (err && err.status === 401) { this.dialogRef.close(); return; }
          const msg = (err && err.error && err.error.message) || 'Upload failed. Please try again.';
          this.errorMsg = msg;
        },
      });
  }

  // --- Link import ---

  validateLinkUrl(): boolean {
    this.linkUrlError = null;
    if (!this.linkUrl.trim()) {
      this.linkUrlError = 'Please enter a URL.';
      return false;
    }
    try {
      const u = new URL(this.linkUrl.trim());
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        this.linkUrlError = 'Only http and https URLs are supported.';
        return false;
      }
    } catch (_) {
      this.linkUrlError = 'Please enter a valid URL (e.g. https://...)';
      return false;
    }
    return true;
  }

  importLink(): void {
    if (!this.validateLinkUrl() || this.loading) return;
    this.loading = true;
    this.errorMsg = null;

    this.assistantService.linkAndExtract(this.linkUrl.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.haptics.scanComplete();
          this.extractionResult = res.extractedFields;
          this.extractionSource = res.url;
          this.step = 'review';
        },
        error: (err) => {
          this.loading = false;
          this.haptics.error();
          if (err && err.status === 401) { this.dialogRef.close(); return; }
          const msg = (err && err.error && err.error.message) || 'Could not import from URL. Please try again.';
          this.errorMsg = msg;
        },
      });
  }

  // --- Generate flow (V4) ---

  runGenerate(): void {
    this.generateErrors = {};
    if (!this.generateInputs.jobTitle.trim()) {
      this.generateErrors.jobTitle = 'Job title is required.';
      return;
    }
    if (this.generateInputs.jobTitle.trim().length < 2) {
      this.generateErrors.jobTitle = 'Job title is too short.';
      return;
    }
    if (this.loading) return;

    this.loading = true;
    this.errorMsg = null;
    // DRAFT-SAFETY FIX: identifies this specific generation attempt so a late
    // response can't mutate the editor/draft after the user has since
    // discarded it (see discardDraft(), which bumps this to invalidate any
    // request still in flight) -- takeUntil(destroy$) alone only covers the
    // whole-component-destroyed case, not "discarded while still open."
    const requestSeq = ++this.generationRequestSeq;

    this.assistantService.generateFromInputs({
      ...this.generateInputs,
      jobTitle: this.generateInputs.jobTitle.trim(),
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.loading = false;
        if (requestSeq !== this.generationRequestSeq) return; // stale -- draft discarded/replaced since this request started
        this.haptics.success();
        this.generatedDraft = res.draft;
        this.generatedJobRoleId = (res.suggestedJobRoleId !== undefined && res.suggestedJobRoleId !== null) ? res.suggestedJobRoleId : null;
        this.assistantService.setGeneratedDraft(res.draft);
        this.step = 'generate_review';
        // Persist the generated-but-unposted result too (Phase 14) -- it's
        // a small serializable JSON object (structured job fields, not
        // media), safe to keep alongside the inputs so a refresh/return
        // doesn't force regeneration. Still requires an explicit Post.
        if (this.ownerScope) {
          this.aiCreateDraft.save(this.generateInputs, this.ownerScope, 'easy-job-post-assistant-modal', 'generated', this.generatedDraft);
        }
      },
      error: (err) => {
        // AI generation failure: the draft (inputs already autosaved) is
        // left completely untouched -- no clear, no mutation.
        this.loading = false;
        if (requestSeq !== this.generationRequestSeq) return; // stale -- draft discarded/replaced since this request started
        this.haptics.error();
        if (err && err.status === 401) {
          // Session expired — the auth interceptor already shows a sign-in toast.
          // Close the modal so the user isn't stuck on a broken screen.
          this.dialogRef.close();
          return;
        }
        const msg = (err && err.error && err.error.message) || 'Could not generate job draft. Please try again.';
        this.errorMsg = msg;
      },
    });
  }

  get reviewFlagsWarning(): ReviewFlag[] {
    if (!this.generatedDraft) return [];
    const flags: ReviewFlag[] = (this.generatedDraft.quality && this.generatedDraft.quality.reviewFlags) || [];
    return flags.filter(f => f.severity === 'warning' || f.severity === 'blocking');
  }

  fillFromGenerated(): void {
    if (!this.generatedDraft) return;
    this.haptics.success();
    // Map generated draft basics into the extraction result format for the job form prefill
    const draft = this.generatedDraft;
    const mapped: AssistantExtractionResult = {
      jobTitle: draft.basics.jobTitle || null,
      jobCity: (draft.basics.jobLocation && draft.basics.jobLocation.city) || null,
      jobCountry: (draft.basics.jobLocation && draft.basics.jobLocation.country) || 'Philippines',
      jobDescription: draft.content.roleSummary || null,
      jobDuties: draft.content.responsibilities.join('\n') || null,
      workSetupHint: draft.basics.workSetup || null,
      jobTypeHint: draft.basics.employmentType || null,
      jobLevelHint: draft.basics.seniority || null,
      salaryMinimum: null,
      salaryMaximum: null,
      salaryCurrency: 'PHP',
      requirements: draft.content.requiredQualifications || [],
      goodToHave: draft.content.preferredQualifications || [],
      skills: draft.content.skills || [],
      confidence: {},
      missingRequiredFields: [],
      warnings: (draft.quality.reviewFlags || []).filter(f => f.severity === 'warning').map(f => f.message),
      jobRoleId: this.generatedJobRoleId,
      // BUG FIX: Industry was chosen (suggested or manually picked) in the
      // Generate step's own dropdown (generateInputs.industry, a name
      // string matched against the live industryOptions), but was never
      // carried into the mapped extraction result -- Step 2's Industry
      // dropdown showed unselected even though the Employer had already
      // provided it. Resolve the real live option id here, once, rather
      // than re-matching a name string every time Step 2 renders.
      industryId: (matchSuggestedIndustry(this.generateInputs.industry, this.industryOptions) || {}).id ?? null,
      interviewQuestions: (draft.application.interviewQuestionSuggestions || []).map((q, i) => ({
        question: q,
        answerDuration: 5,
        retakes: 5,
        sequence: i + 1,
      })),
    };
    this.assistantService.setExtractionResult(mapped);
    this.dialogRef.close({ navigateTo: '/recruiter/jobs/create', fromGenerate: true });
    this.router.navigate(['/recruiter/jobs/create'], { queryParams: { fromAssistant: '1', mode: 'generated' } });
  }

  /**
   * BUG #2 FIX: publishes the AI-generated draft directly, without routing
   * the employer through the full manual job-create stepper. This is an
   * ADDITIONAL fast path alongside fillFromGenerated() ("Use this draft"),
   * which still hands off to the manual form unchanged for anyone who wants
   * to review/edit first.
   *
   * Reuses the exact same hint->id resolvers the manual form's
   * applyAssistantPrefill()/formatJob() use (resolveJobLevelId,
   * resolveWorkSetupId, resolveJobTypeId) so a directly-posted job resolves
   * job level/work setup/employment type identically to one that went
   * through the manual review step. Job banner is deliberately left unset --
   * see job-readiness.service.ts, which no longer treats it as required
   * (Bug #1 fix), so omitting it here does not block anything server-side.
   */
  postJobNow(): void {
    if (!this.generatedDraft || this.postingNow) return;
    this.errorMsg = null;

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const companyId = user && user.companyId;
    if (!companyId) {
      this.errorMsg = 'Your company profile is not set up yet. Please complete it before publishing.';
      return;
    }

    this.postingNow = true;
    this.haptics.selection();
    const draft = this.generatedDraft;

    this.jobService.getLevelList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const levels: LevelOption[] = (res && res.data) || res || [];
        const levelMatch = resolveJobLevelId(draft.basics.seniority, levels);
        const workSetupId = resolveWorkSetupId(draft.basics.workSetup);
        const rawJobTypeId = resolveJobTypeId(draft.basics.employmentType);
        // FREELANCE_JOB_TYPE_SENTINEL has no backend job_type row -- never
        // send it as a fabricated jobTypeId (mirrors JobCreateComponent.formatJob()).
        const jobTypeId = rawJobTypeId === FREELANCE_JOB_TYPE_SENTINEL ? null : (rawJobTypeId as number | null);
        const industryMatch = matchSuggestedIndustry(this.generateInputs.industry, this.industryOptions);

        // BUGFIX (production 422 on POST /job/create): this only accepted
        // 'high' confidence for job level, and left jobLevelId/workSetupId/
        // jobTypeId as `undefined` whenever the AI draft's free-text hint
        // didn't resolve -- but jobStatusId:2 (Published, set below) makes
        // all three required server-side (jobMiddleware.js's
        // validateJobPublishPayload). A generated draft whose seniority only
        // matched a synonym bucket ('medium' confidence -- a real match, not
        // a guess) or whose work setup/employment type phrasing wasn't in
        // resolveWorkSetupId/resolveJobTypeId's fixed keyword list silently
        // hit that gate with no explanation, surfacing only a bare 422 in
        // the browser console. 'medium' is now accepted (fixes the common
        // case); a genuine remaining gap is now caught here, before the
        // request, with a specific, actionable message instead of a 422.
        const resolvedJobLevelId = levelMatch.confidence !== 'none' ? levelMatch.id : null;

        const missingLabels: string[] = [];
        if (!resolvedJobLevelId) missingLabels.push('Experience level');
        if (!workSetupId) missingLabels.push('Work setup');
        if (!jobTypeId) missingLabels.push('Employment type');
        if (missingLabels.length > 0) {
          this.postingNow = false;
          this.errorMsg = `The AI draft didn't clearly specify: ${missingLabels.join(', ')}. `
            + `Use "Use this draft" below to fill these in before publishing.`;
          return;
        }

        const job: Model.Job = {
          jobTitle: draft.basics.jobTitle || '',
          companyId,
          industryId: industryMatch ? industryMatch.id : undefined,
          jobRoleId: this.generatedJobRoleId ?? undefined,
          jobTypeId: jobTypeId,
          jobLevelId: resolvedJobLevelId,
          jobDescription: draft.content.roleSummary || '',
          jobDuties: (draft.content.responsibilities || []).join('\n'),
          workSetupId: workSetupId,
          jobCity: (draft.basics.jobLocation && draft.basics.jobLocation.city) || '',
          jobCountry: (draft.basics.jobLocation && draft.basics.jobLocation.country) || 'Philippines',
          isInterviewRequired: false,
          requirements: draft.content.requiredQualifications || [],
          goodToHave: draft.content.preferredQualifications || [],
          skills: draft.content.skills || [],
          interviewQuestions: (draft.application.interviewQuestionSuggestions || []).map((q, i) => ({
            question: q,
            answerDuration: 5,
            retakes: 5,
            sequence: i + 1,
          } as any)),
          jobStatusId: 2, // Published
        };

        this.jobService.saveJob(job).pipe(takeUntil(this.destroy$)).subscribe({
          next: (saveRes: any) => {
            this.postingNow = false;
            this.haptics.success();
            const newId = saveRes && saveRes.data && saveRes.data.jobId;
            // Same reasoning as fillFromGenerated()/afterSubmit() in
            // job-create.component.ts: once the job has real server
            // persistence, the local AI Create recovery draft is redundant.
            if (this.ownerScope) this.aiCreateDraft.clear(this.ownerScope);
            this.snackbarService.success('"' + job.jobTitle + '" is now live.', '', 5000);
            // BUGFIX: this modal is opened FROM the Jobs List page in the
            // common case (its own "Post a Job" button). Navigating there
            // with router.navigate() alone is a same-route navigation
            // (only queryParams differ), which Angular does not re-run
            // ngOnInit() for -- JobListComponent's own getBasicList() fetch
            // never re-fired, so the just-published job silently waited for
            // a manual page refresh to appear. Refreshing the store here
            // directly guarantees it shows immediately, whether the list
            // page is already mounted (its list$ | async just re-renders)
            // or about to mount fresh (its own ngOnInit fetch is then just
            // a harmless duplicate).
            this.jobFacade.getBasicList(companyId);
            this.dialogRef.close({ navigateTo: '/recruiter/jobs/list', published: true });
            this.router.navigate(['/recruiter/jobs/list'], newId ? { queryParams: { published: newId } } : undefined);
          },
          error: (err) => {
            this.postingNow = false;
            this.haptics.error();
            if (err && err.status === 401) { this.dialogRef.close(); return; }
            // Surface the backend's own `missing` field list when present
            // (validateJobPublishPayload's 422 shape) instead of just its
            // generic message -- covers any required field the pre-check
            // above doesn't already catch (e.g. city/country/description).
            const missing = err && err.error && err.error.missing;
            const baseMsg = (err && err.error && err.error.message) || 'Could not publish this job. Please try again.';
            this.errorMsg = (Array.isArray(missing) && missing.length > 0)
              ? `${baseMsg} (${missing.join(', ')})`
              : baseMsg;
          },
        });
      },
      error: () => {
        this.postingNow = false;
        this.errorMsg = 'Could not load job levels. Please try again.';
      },
    });
  }

  // --- Review + prefill ---

  get fieldCount(): number {
    if (!this.extractionResult) return 0;
    let count = 0;
    const r = this.extractionResult;
    if (r.jobTitle) count++;
    if (r.jobCity) count++;
    if (r.jobDescription) count++;
    if (r.jobDuties) count++;
    if (r.jobTypeHint) count++;
    if (r.jobLevelHint) count++;
    if (r.workSetupHint) count++;
    if (r.salaryMinimum) count++;
    if (r.requirements && r.requirements.length) count++;
    if (r.skills && r.skills.length) count++;
    return count;
  }

  private readonly FIELD_LABELS: { [key: string]: string } = {
    jobTitle: 'Job title',
    jobCity: 'City',
    jobDescription: 'Job description',
    jobTypeId: 'Job type',
    jobLevelId: 'Experience level',
    workSetupId: 'Work setup',
  };

  get requiredStillNeeded(): string[] {
    if (!this.extractionResult) return [];
    const need = (this.extractionResult.missingRequiredFields || []);
    return need.map(f => this.FIELD_LABELS[f] || f);
  }

  fillJobForm(): void {
    if (!this.extractionResult) return;
    this.haptics.success();
    this.assistantService.setExtractionResult(this.extractionResult);
    this.dialogRef.close({ navigateTo: '/recruiter/jobs/create' });
    this.router.navigate(['/recruiter/jobs/create'], { queryParams: { fromAssistant: '1' } });
  }

  close(): void {
    this.dialogRef.close(null);
  }

  getFileIcon(): string {
    if (!this.selectedFile) return '📄';
    const name = this.selectedFile.name.toLowerCase();
    if (name.endsWith('.pdf')) return '📕';
    if (name.endsWith('.docx') || name.endsWith('.doc')) return '📘';
    return '📄';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
