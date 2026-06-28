import {
  Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { ImageUploadService } from '../../services/api/image-upload.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface GhImageUploadResult {
  primaryUrl: string;
  srcset: string | null;
  variants: any[];
  savingsPercent: number;
  original: { width: number; height: number; sizeBytes: number; mime: string };
}

type UploadState = 'idle' | 'selecting' | 'uploading' | 'success' | 'error';

@Component({
  selector: 'app-gh-image-upload',
  templateUrl: './gh-image-upload.component.html',
  styleUrls: ['./gh-image-upload.component.scss']
})
export class GhImageUploadComponent implements OnInit, OnDestroy {
  @Input() purpose: string = 'company_logo';
  @Input() label: string = 'Upload image';
  @Input() hint: string = 'JPG, PNG, or WebP · Max 5 MB';
  @Input() currentUrl: string = '';
  @Input() accept: string = 'image/jpeg,image/png,image/webp';
  @Input() previewShape: 'square' | 'wide' | 'circle' = 'square';
  @Input() disabled: boolean = false;

  @Output() uploaded = new EventEmitter<GhImageUploadResult>();
  @Output() cleared = new EventEmitter<void>();
  @Output() uploadError = new EventEmitter<{ code: string; message: string }>();

  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

  state: UploadState = 'idle';
  previewDataUrl: string = '';
  errorMessage: string = '';
  savingsPercent: number = 0;
  isDragOver: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(private imageUploadService: ImageUploadService) {}

  ngOnInit(): void {
    if (this.currentUrl) {
      this.previewDataUrl = this.currentUrl;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasPreview(): boolean {
    return !!(this.previewDataUrl || this.currentUrl);
  }

  get displayUrl(): string {
    return this.previewDataUrl || this.currentUrl || '';
  }

  onPickFile(): void {
    if (this.disabled || this.state === 'uploading') { return; }
    this.fileInput.nativeElement.click();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) { return; }
    this.handleFile(input.files[0]);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    if (this.disabled || this.state === 'uploading') { return; }
    const files = event.dataTransfer && event.dataTransfer.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onClear(): void {
    this.previewDataUrl = '';
    this.errorMessage = '';
    this.state = 'idle';
    this.savingsPercent = 0;
    this.cleared.emit();
  }

  private handleFile(file: File): void {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.indexOf(file.type) === -1) {
      this.state = 'error';
      this.errorMessage = 'Please use a JPG, PNG, or WebP image.';
      this.uploadError.emit({ code: 'unsupported_image_format', message: this.errorMessage });
      return;
    }

    // Local preview immediately
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.previewDataUrl = (e.target && e.target.result) ? (e.target.result as string) : '';
    };
    reader.readAsDataURL(file);

    this.state = 'uploading';
    this.errorMessage = '';

    this.imageUploadService.uploadImage(file, this.purpose)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          if (res && res.success && res.image) {
            this.state = 'success';
            this.previewDataUrl = res.image.primaryUrl || this.previewDataUrl;
            this.savingsPercent = (res.image.optimized && res.image.optimized.savingsPercent) || 0;
            this.uploaded.emit({
              primaryUrl:      res.image.primaryUrl,
              srcset:          res.image.srcset || null,
              variants:        res.image.variants || [],
              savingsPercent:  this.savingsPercent,
              original:        res.image.original || { width: 0, height: 0, sizeBytes: 0, mime: file.type },
            });
          } else {
            this.handleUploadError(res);
          }
        },
        (err: any) => {
          const errBody = (err && err.error) ? err.error : {};
          this.handleUploadError(errBody);
        }
      );
  }

  private handleUploadError(res: any): void {
    this.state = 'error';
    const err = (res && res.error) ? res.error : res || {};
    this.errorMessage = err.message || 'Upload failed. Please try again.';
    this.previewDataUrl = this.currentUrl || '';
    this.uploadError.emit({ code: err.code || 'unknown_error', message: this.errorMessage });
  }
}
