import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface VideoPreviewItem {
  question: string;
  url: string;
  createdAt?: string;
}

@Component({
  selector: 'app-video-preview',
  templateUrl: './video-preview.component.html',
  styleUrls: ['./video-preview.component.scss']
})
export class VideoPreviewComponent implements OnInit {

  isVideoBuffering = true;
  hasVideoError = false;

  // PROFESSIONAL REVIEW MODE: when data.items is supplied (multiple interview
  // answers for one applicant), this dialog becomes a single review panel the
  // recruiter can step through with Next/Previous instead of closing and
  // reopening a fresh modal per question. data.items absent (the original,
  // single-video contract -- Video CV, applicant's own Step 3 preview) keeps
  // the exact previous single-video behavior untouched.
  items: VideoPreviewItem[] | null = null;
  currentIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<VideoPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) { }

  ngOnInit(): void {
    if (this.data && Array.isArray(this.data.items) && this.data.items.length) {
      this.items = this.data.items;
      const start = Number(this.data.startIndex) || 0;
      this.currentIndex = Math.min(Math.max(start, 0), this.items.length - 1);
    }
  }

  get hasMultiple(): boolean {
    return !!this.items && this.items.length > 1;
  }

  get currentItem(): VideoPreviewItem | null {
    return this.items ? this.items[this.currentIndex] : null;
  }

  get currentUrl(): string {
    return this.items ? this.currentItem.url : (this.data && this.data.url);
  }

  get kicker(): string {
    if (this.items) return `Video Answer Preview`;
    return (this.data && this.data.title) ? 'Video Answer Preview' : 'Video CV Preview';
  }

  get title(): string {
    if (this.items) return this.currentItem.question || `Answer ${this.currentIndex + 1}`;
    return (this.data && this.data.title) ? this.data.title : 'Candidate introduction video';
  }

  get progressLabel(): string {
    return this.items ? `Answer ${this.currentIndex + 1} of ${this.items.length}` : '';
  }

  goPrev(): void {
    if (!this.items) return;
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.resetPlaybackState();
  }

  goNext(): void {
    if (!this.items) return;
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.resetPlaybackState();
  }

  jumpTo(index: number): void {
    if (!this.items || index === this.currentIndex) return;
    this.currentIndex = index;
    this.resetPlaybackState();
  }

  private resetPlaybackState(): void {
    this.isVideoBuffering = true;
    this.hasVideoError = false;
    this.safeHaptic(6);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.items) return;
    if (event.key === 'ArrowRight') { this.goNext(); }
    if (event.key === 'ArrowLeft') { this.goPrev(); }
  }

  onVideoBuffering(): void {
    this.isVideoBuffering = true;
  }

  onVideoReady(): void {
    this.isVideoBuffering = false;
    this.hasVideoError = false;
  }

  onVideoError(): void {
    this.isVideoBuffering = false;
    this.hasVideoError = true;
  }

  cancel(): void {
    this.safeHaptic(8);
    this.dialogRef.close(null);
  }

  private safeHaptic(pattern: number | number[] = 10): void {
    try {
      if (typeof window === 'undefined') { return; }
      if (typeof navigator === 'undefined') { return; }
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) { return; }
      if ('vibrate' in navigator) {
        (navigator as any).vibrate(pattern);
      }
    } catch (e) {
      // no-op — vibrate not supported or blocked
    }
  }
}
