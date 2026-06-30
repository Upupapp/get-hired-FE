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
import { takeUntil } from 'rxjs/operators';
import {
  AnonPreviewResponse,
  PublicJobPreviewService,
} from '../../services/public-job-preview.service';
import { HapticFeedbackService } from '@app-shared/services/haptic-feedback/haptic-feedback.service';

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
