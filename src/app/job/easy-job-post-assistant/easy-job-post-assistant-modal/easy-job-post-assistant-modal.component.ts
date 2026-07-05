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

  private destroy$ = new Subject<void>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EasyJobPostAssistantModalComponent>,
    private assistantService: EasyJobPostAssistantService,
    private router: Router,
    private haptics: HapticFeedbackService,
  ) {}

  ngOnInit(): void {
    if (this.data) {
      if (this.data.companyCity) {
        this.generateInputs.location = this.data.companyCity;
      }
      if (this.data.companyIndustryName) {
        this.generateInputs.industry = this.data.companyIndustryName;
      }
      if (this.data.workSetupId) {
        const wsNames: { [key: number]: string } = { 1: 'On-site', 2: 'Remote', 3: 'Hybrid' };
        this.generateInputs.workSetup = wsNames[this.data.workSetupId] || '';
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

    this.assistantService.generateFromInputs({
      ...this.generateInputs,
      jobTitle: this.generateInputs.jobTitle.trim(),
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.loading = false;
        this.haptics.success();
        this.generatedDraft = res.draft;
        this.generatedJobRoleId = (res.suggestedJobRoleId !== undefined && res.suggestedJobRoleId !== null) ? res.suggestedJobRoleId : null;
        this.assistantService.setGeneratedDraft(res.draft);
        this.step = 'generate_review';
      },
      error: (err) => {
        this.loading = false;
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
