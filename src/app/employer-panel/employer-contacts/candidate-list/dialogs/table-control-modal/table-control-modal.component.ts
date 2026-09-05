import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-table-control-modal',
  templateUrl: './table-control-modal.component.html',
  styleUrls: ['./table-control-modal.component.scss']
})
export class TableControlModalComponent implements OnInit {

  // TALENT-WORKSPACE-REDESIGN: relabeled from "View Candidate Detail" --
  // this modal opens from a job-scoped Applicants list (candidate-list.
  // component.ts filters strictly to one job_id) and its target view
  // (getJobApplicantDetails -- see JobService) returns this job's
  // application data (screening answers, CV, this application's status),
  // not a cross-job candidate profile. "View Application" states what's
  // actually being opened; the app has no separate cross-job "Candidate
  // Profile" view to distinguish this from today.
  public tableControls: any[] = [
    {
      id: "view-details",
      title: "View Application",
      icon: "/assets/images/icons/client-menu/service-templates.png",
      background: "#f7f2e4"
    },
  ];

  constructor(
    public dialogRef: MatDialogRef<TableControlModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private router: Router,
    private route: ActivatedRoute) { }

  // BUGFIX (QA EM-28, P3): the no-photo fallback was a realistic stock
  // person photo (job-post-banner-person.png, actually meant for job
  // banners) rendered with alt="Applicant photo" -- indistinguishable from
  // a real uploaded photo and misleading about whether this candidate
  // actually uploaded one. Replaced with an honest initials avatar,
  // matching the same pattern already used elsewhere in this app
  // (recruiter-messages.component.ts's avatarInitial()).
  hasAvatarError = false;

  ngOnInit(): void {}

  onAvatarError(): void {
    this.hasAvatarError = true;
  }

  get showRealAvatar(): boolean {
    return !!this.data?.photo_url && !this.hasAvatarError;
  }

  get avatarInitial(): string {
    const name = (this.data?.full_name || '').trim();
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  get statusClass(): string {
    const status = (this.data?.status || '').toString().toLowerCase();
    if (status.includes('hire') || status.includes('accept') || status.includes('approve')) {
      return 'is-success';
    }
    if (status.includes('reject') || status.includes('decline') || status.includes('fail')) {
      return 'is-error';
    }
    if (status.includes('pending') || status.includes('review') || status.includes('progress')) {
      return 'is-warning';
    }
    return 'is-neutral';
  }

  close() {
    this.dialogRef.close(null);
  }

  openControlMenu(menu: any) {
    if (menu?.route) {
      this.dialogRef.close()
      this.router.navigate([`${menu?.route}`])
    }

    if (menu?.id === 'view-details') {
      this.dialogRef.close({
        cancel: false,
        data: this.data,
        profile: true
      });
      // this.router.navigate([`/company/jobs/${this.data?.job_id}/applicants/details/${this.data?.data?.id}`])
    }
  }

}
