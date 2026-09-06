import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { Router } from '@angular/router';
import { JobService } from '@app-job/job.service';

@Component({
  selector: 'app-applicant-action-modal',
  templateUrl: './applicant-action-modal.component.html',
  styleUrls: ['./applicant-action-modal.component.scss']
})
export class ApplicantActionModalComponent implements OnInit {
  statusView = false;
  statusUpdating = false;
  confirmingStatus: { id: number; name: string } | null = null;

  // BUGFIX: trimmed from 5 hardcoded options (Applied/Under Review/
  // Shortlisted/Rejected/Hired, with hardcoded ids 2-6 from the seed
  // migration) to just the two terminal statuses this action is meant
  // for -- Applied/Under Review/Shortlisted are still real statuses (set
  // automatically elsewhere, e.g. Under Review on interview submission)
  // and still display correctly wherever an applicant's status is shown,
  // they're just no longer manually selectable here.
  //
  // ROOT-CAUSE FIX: the hardcoded ids (5=Rejected, 6=Hired) from the seed
  // migration do NOT match live production data -- confirmed via the
  // existing per-applicant endpoint that application_status_id=6 is
  // actually named "Rejected" live, not "Hired" (the seed's
  // `ON CONFLICT DO NOTHING` silently skipped correcting whatever
  // id->name mapping already existed). Hardcoding ids here would have
  // meant clicking "Hired" actually set an applicant to whatever id 6
  // really means in production, and the automatic status-change email
  // would tell them the wrong thing. Instead, this fetches the REAL
  // id->name mapping from the backend and resolves "Hired"/"Rejected" by
  // name -- correct regardless of the real numbering.
  statusOptions: { id: number; name: string }[] = [];
  loadingStatusOptions = false;
  statusOptionsError: string | null = null;

  public tableControls: any[] = [
    {
      id: 'Video-cv',
      title: 'Video CV',
      icon: '/assets/images/icons/client-menu/about-me.png',
      background: '#FEF1FC'
    },
    {
      id: 'change-status',
      title: 'Change Status',
      icon: '/assets/images/icons/client-menu/individual-intake.png',
      background: '#D7F4F8'
    },
    {
      id: 'view-applicant',
      title: 'Applicant Details',
      icon: '/assets/images/icons/client-menu/service-templates.png',
      background: '#f7f2e4'
    },
  ];

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<ApplicantActionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private snackbarService: SnackbarService,
    private jobService: JobService,
  ) {}

  ngOnInit(): void {
    this.loadStatusOptions();
  }

  // Resolves "Hired"/"Rejected" to their real ids from the backend's live
  // job_applicant_status table, instead of assuming ids. If either name
  // is genuinely missing from that table (a real data problem, not
  // expected), the action fails loudly with a clear message rather than
  // silently offering nothing or guessing an id.
  private loadStatusOptions(): void {
    this.loadingStatusOptions = true;
    this.statusOptionsError = null;
    this.jobService.getApplicantStatusOptions().subscribe({
      next: (res: any) => {
        this.loadingStatusOptions = false;
        const all = (res?.data || []) as { id: number; name: string }[];
        const hired = all.find((s) => s.name === 'Hired');
        const rejected = all.find((s) => s.name === 'Rejected');
        if (!hired || !rejected) {
          this.statusOptionsError = "Couldn't find the Hired/Rejected statuses. Please contact support.";
          this.statusOptions = [];
          return;
        }
        this.statusOptions = [rejected, hired];
      },
      error: () => {
        this.loadingStatusOptions = false;
        this.statusOptionsError = "We couldn't load status options right now. Please try again.";
        this.statusOptions = [];
      },
    });
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/images/placeholder/job-post-banner-person.png';
  }

  trackById(_index: number, item: any): any {
    return item.id;
  }

  close() {
    this.dialogRef.close(null);
  }

  viewCv() {
    this.dialogRef.close({
      cancel: false,
      data: this.data,
      view: true
    });
  }

  openControlMenu(menu: any) {
    if (menu && menu.route) {
      this.dialogRef.close();
      this.router.navigate([`${menu.route}`]);
    }

    if (menu && menu.id === 'Video-cv') {
      this.viewCv();
    }

    if (menu && menu.id === 'view-applicant') {
      this.dialogRef.close({
        cancel: false,
        data: this.data,
        profile: true
      });
    }

    if (menu && menu.id === 'change-status') {
      this.statusView = true;
    }
  }

  isCurrentStatus(statusId: number): boolean {
    const current = this.data && this.data.data && this.data.data.jobApplicationStatusId;
    return !!current && statusId === parseInt(String(current), 10);
  }

  selectStatus(statusId: number, statusName: string): void {
    const applicationId = this.data && this.data.data && this.data.data.applicationId;
    if (!applicationId) {
      this.snackbarService.error("We couldn't find this application. Please close and try again.", 'Dismiss', 4000);
      return;
    }
    const currentStatusId = this.data && this.data.data && this.data.data.jobApplicationStatusId;
    if (statusId === parseInt(currentStatusId, 10)) {
      this.snackbarService.info('This applicant is already at that status — no change made.', 'Dismiss', 3000);
      this.dialogRef.close(null);
      return;
    }
    // Every remaining option (Hired/Rejected, resolved dynamically in
    // loadStatusOptions()) triggers an email to the applicant -- always
    // require confirmation. Previously branched on hardcoded ids (5/6);
    // no longer needed since those are now the only two options at all.
    this.confirmingStatus = { id: statusId, name: statusName };
  }

  confirmStatusChange(): void {
    if (!this.confirmingStatus) { return; }
    const id = this.confirmingStatus.id;
    const name = this.confirmingStatus.name;
    this.confirmingStatus = null;
    this.applyStatusUpdate(id, name);
  }

  cancelConfirm(): void {
    this.confirmingStatus = null;
  }

  applyStatusUpdate(statusId: number, statusName: string): void {
    const applicationId = this.data && this.data.data && this.data.data.applicationId;
    this.statusUpdating = true;
    this.jobService.updateApplicationStatus(applicationId, statusId).subscribe(
      () => {
        this.statusUpdating = false;
        this.snackbarService.success(`Application status updated to "${statusName}".`, 'OK', 3000);
        this.dialogRef.close({ statusUpdated: true, newStatusId: statusId, newStatusName: statusName, applicationId: applicationId });
      },
      (err: any) => {
        this.statusUpdating = false;
        const msg = (err && err.error && err.error.message) || "We couldn't update the status. Please try again.";
        this.snackbarService.error(msg, 'OK', 4000);
      }
    );
  }
}
