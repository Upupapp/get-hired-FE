import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { JobService } from '@app-job/job.service';

const STATUS_OPTIONS = [
  { id: 2, name: 'Applied' },
  { id: 3, name: 'Under Review' },
  { id: 4, name: 'Shortlisted' },
  { id: 5, name: 'Rejected' },
  { id: 6, name: 'Hired' },
];

@Component({
  selector: 'app-applicant-action-modal',
  templateUrl: './applicant-action-modal.component.html',
  styleUrls: ['./applicant-action-modal.component.scss']
})
export class ApplicantActionModalComponent implements OnInit {
  statusView = false;
  statusUpdating = false;
  readonly statusOptions = STATUS_OPTIONS;

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
    private snackBar: MatSnackBar,
    private jobService: JobService,
  ) {}

  ngOnInit(): void {}

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

  selectStatus(statusId: number, statusName: string): void {
    const applicationId = this.data && this.data.data && this.data.data.applicationId;
    if (!applicationId) {
      this.snackBar.open("We couldn't find this application. Please close and try again.", 'Dismiss', { duration: 4000 });
      return;
    }
    const currentStatusId = this.data && this.data.data && this.data.data.jobApplicationStatusId;
    if (statusId === parseInt(currentStatusId, 10)) {
      this.snackBar.open('This applicant is already at that status — no change made.', 'Dismiss', { duration: 3000 });
      this.dialogRef.close(null);
      return;
    }
    this.statusUpdating = true;
    this.jobService.updateApplicationStatus(applicationId, statusId).subscribe(
      () => {
        this.statusUpdating = false;
        this.snackBar.open(`Application status updated to "${statusName}".`, 'OK', { duration: 3000 });
        this.dialogRef.close({ statusUpdated: true, newStatusId: statusId, newStatusName: statusName });
      },
      (err: any) => {
        this.statusUpdating = false;
        const msg = (err && err.error && err.error.message) || "We couldn't update the status. Please try again.";
        this.snackBar.open(msg, 'OK', { duration: 4000 });
      }
    );
  }
}
