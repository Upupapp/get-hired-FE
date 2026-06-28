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
import { AssistantExtractionResult, AssistantStep } from '../easy-job-post-assistant.models';
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

  // Extraction result
  extractionResult: AssistantExtractionResult | null = null;
  extractionSource: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EasyJobPostAssistantModalComponent>,
    private assistantService: EasyJobPostAssistantService,
    private router: Router,
    private haptics: HapticFeedbackService,
  ) {}

  ngOnInit(): void {}

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
          const msg = (err && err.error && err.error.message) || 'Could not import from URL. Please try again.';
          this.errorMsg = msg;
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

  get requiredStillNeeded(): string[] {
    if (!this.extractionResult) return [];
    const alwaysNeeded = ['jobBanner'];
    const need = (this.extractionResult.missingRequiredFields || []).filter(f => alwaysNeeded.indexOf(f) === -1);
    return need;
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
