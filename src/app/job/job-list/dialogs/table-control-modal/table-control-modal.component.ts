import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { JobService } from '@app-job/job.service';

@Component({
  selector: 'app-table-control-modal',
  templateUrl: './table-control-modal.component.html',
  styleUrls: ['./table-control-modal.component.scss']
})
export class TableControlModalComponent implements OnInit, OnDestroy {

  // data passed in from job-list: a mappedBasicJob row + status label
  job: any = null;

  // action-summary DTO from backend
  summary: any = null;
  summaryLoading = true;
  summaryError = false;

  // delete confirmation state — Phase 5
  confirmDelete = false;
  deleteLoading = false;

  // copy-link feedback
  linkCopied = false;

  private sub: Subscription = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<TableControlModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private translate: TranslateService,
    private clipboard: Clipboard,
    private jobService: JobService
  ) {}

  ngOnInit(): void {
    this.job = this.data || {};
    this.loadSummary();
  }

  private loadSummary(): void {
    const jobId = this.job && this.job.jobId;
    if (!jobId) {
      this.summaryLoading = false;
      this.summaryError = true;
      return;
    }

    this.sub.add(
      this.jobService.getJobActionSummary(jobId).subscribe({
        next: (res: any) => {
          this.summary = (res && res.data) ? res.data : null;
          this.summaryLoading = false;
        },
        error: () => {
          this.summaryLoading = false;
          this.summaryError = true;
        }
      })
    );
  }

  // Derive status from summary (fresh from BE) or fall back to data.jobStatusId
  get jobStatusId(): number {
    return (this.summary && this.summary.job && this.summary.job.statusId)
      ? this.summary.job.statusId
      : (this.job ? this.job.jobStatusId : 1);
  }

  get statusLabel(): string {
    const id = this.jobStatusId;
    const map: Record<number, string> = { 1: 'Draft', 2: 'Published', 3: 'Expired', 4: 'Archived' };
    return map[id] || 'Draft';
  }

  get statusKey(): string {
    const id = this.jobStatusId;
    const map: Record<number, string> = { 1: 'draft', 2: 'published', 3: 'expired', 4: 'archived' };
    return map[id] || 'draft';
  }

  get canView(): boolean {
    if (this.summary && this.summary.actions) { return !!this.summary.actions.canView; }
    return this.jobStatusId === 2;
  }

  get canShare(): boolean {
    if (this.summary && this.summary.actions) { return !!this.summary.actions.canShare; }
    return this.jobStatusId === 2;
  }

  get publicUrl(): string {
    return (this.summary && this.summary.job && this.summary.job.publicUrl)
      ? this.summary.job.publicUrl
      : '/jobs/details/' + (this.job && this.job.jobId);
  }

  get totalApplicants(): number {
    return (this.summary && this.summary.summary) ? this.summary.summary.totalApplicants : 0;
  }

  get interviewQuestionsCount(): number {
    return (this.summary && this.summary.summary) ? this.summary.summary.interviewQuestionsCount : 0;
  }

  get jobTitle(): string {
    return (this.summary && this.summary.job && this.summary.job.title)
      ? this.summary.job.title
      : (this.job ? this.job.jobTitle : '');
  }

  get jobId(): string {
    return this.job && this.job.jobId ? this.job.jobId : '';
  }

  get workSetupName(): string {
    return (this.summary && this.summary.job && this.summary.job.workSetupName)
      ? this.summary.job.workSetupName
      : (this.job ? this.job.workSetupName : '');
  }

  close(): void {
    if (this.confirmDelete) {
      // back out of confirm — do not close the full modal
      this.confirmDelete = false;
      return;
    }
    this.dialogRef.close(null);
  }

  viewPublicJob(): void {
    if (!this.canView) { return; }
    this.dialogRef.close(null);
    window.open(this.publicUrl, '_blank', 'noopener');
  }

  previewJob(): void {
    this.dialogRef.close(null);
    this.router.navigate(['/recruiter/jobs/view'], { queryParams: { id: this.jobId } });
  }

  editJob(): void {
    this.dialogRef.close(null);
    this.router.navigate(['recruiter/jobs/edit'], { queryParams: { id: this.jobId } });
  }

  viewApplicants(): void {
    this.dialogRef.close(null);
    this.router.navigate(['recruiter/jobs/applicants'], { queryParams: { id: this.jobId } });
  }

  createInterview(): void {
    this.dialogRef.close(null);
    this.router.navigate(['/recruiter/interview']);
  }

  copyLink(): void {
    if (!this.canShare) { return; }
    const url = window.location.origin + this.publicUrl;
    this.clipboard.copy(url);
    this.linkCopied = true;
    if (typeof (window as any).navigator !== 'undefined' && (window as any).navigator.vibrate) {
      try { (window as any).navigator.vibrate(8); } catch (_) {}
    }
    setTimeout(() => { this.linkCopied = false; }, 2200);
  }

  openDeleteConfirm(): void {
    this.confirmDelete = true;
  }

  cancelDelete(): void {
    this.confirmDelete = false;
  }

  confirmDeleteJob(): void {
    // Close modal and return the job data to the parent — job-list.component.ts
    // handles the actual delete dispatch and second confirmation dialog.
    this.dialogRef.close(this.job);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
