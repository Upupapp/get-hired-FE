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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EasyJobPostAssistantService } from '../easy-job-post-assistant.service';
import { AssistantExtractionResult, AssistantStep, GenerateIntentInputs, InstantJobDraft, ReviewFlag } from '../easy-job-post-assistant.models';
import { HapticFeedbackService } from '@main/shared/services/haptic-feedback/haptic-feedback.service';
import { AiCreateDraftService } from '@app-job/services/ai-create-draft.service';
import { JobService } from '@app-job/job.service';
import { Options } from '@app-job/job.model';
import { suggestIndustryName, matchSuggestedIndustry } from '@app-job/utils/job-industry-suggester';

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
  private ownerScope: string | null = null;
  private autosaveTimerId: any = null;
  private generationRequestSeq = 0;

  private destroy$ = new Subject<void>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EasyJobPostAssistantModalComponent>,
    private assistantService: EasyJobPostAssistantService,
    private router: Router,
    private haptics: HapticFeedbackService,
    private aiCreateDraft: AiCreateDraftService,
    private jobService: JobService,
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.ownerScope = user && user._id;

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
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- AI Create draft persistence (autosave) -----------------------------

  /** Debounced autosave -- called from (ngModelChange) on every Generate-step
   *  field. Short debounce, not a write on every keystroke synchronously. */
  scheduleAutosave(): void {
    if (!this.ownerScope) return;
    if (this.autosaveTimerId) clearTimeout(this.autosaveTimerId);
    this.autosaveTimerId = setTimeout(() => {
      // Don't persist a draft with no title at all -- nothing meaningful to resume.
      if (!this.generateInputs.jobTitle || !this.generateInputs.jobTitle.trim()) return;
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
    this.assistantService.clearExtractionResult();
    this.dialogRef.close({ navigateTo: '/recruiter/jobs/create' });
    this.router.navigate(['/recruiter/jobs/create']);
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
