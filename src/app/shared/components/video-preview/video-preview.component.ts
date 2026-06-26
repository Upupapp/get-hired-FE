import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-video-preview',
  templateUrl: './video-preview.component.html',
  styleUrls: ['./video-preview.component.scss']
})
export class VideoPreviewComponent implements OnInit {

  isVideoBuffering = true;
  hasVideoError = false;

  constructor(
    public dialogRef: MatDialogRef<VideoPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) { }

  ngOnInit(): void { }

  get kicker(): string {
    return (this.data && this.data.title) ? 'Video Answer Preview' : 'Video CV Preview';
  }

  get title(): string {
    return (this.data && this.data.title) ? this.data.title : 'Candidate introduction video';
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
