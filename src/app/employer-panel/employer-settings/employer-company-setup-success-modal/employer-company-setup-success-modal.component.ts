import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

export interface SetupSuccessModalData {
  companyName: string;
  companySlug: string;
  profileCompleteness: number;
}

@Component({
  selector: 'app-employer-company-setup-success-modal',
  templateUrl: './employer-company-setup-success-modal.component.html',
  styleUrls: ['./employer-company-setup-success-modal.component.scss']
})
export class EmployerCompanySetupSuccessModalComponent implements OnInit {
  companyName: string = '';
  companySlug: string = '';
  profileCompleteness: number = 0;

  checklist: { label: string; done: boolean }[] = [
    { label: 'Company created', done: true },
    { label: 'Free trial activated — 7 days full access', done: true },
    { label: 'Post your first job', done: false },
    { label: 'Complete company profile', done: false },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SetupSuccessModalData,
    private dialogRef: MatDialogRef<EmployerCompanySetupSuccessModalComponent>,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.companyName = (this.data && this.data.companyName) ? this.data.companyName : 'Your company';
    this.companySlug = (this.data && this.data.companySlug) ? this.data.companySlug : '';
    this.profileCompleteness = (this.data && this.data.profileCompleteness) ? this.data.profileCompleteness : 0;

    try {
      sessionStorage.setItem('gh_company_setup_success_seen', '1');
    } catch (_) {}
  }

  /** BUG FIX: this used to navigate straight to /recruiter/jobs/create with
   *  no assistant data -- JobCreateComponent reached that way is always the
   *  clean, manual "Start From Scratch" form (by design, see its own
   *  ngOnInit()), so AI Create never actually opened here despite this
   *  being the "Post your first job" CTA. Routes through the Dashboard with
   *  the same ?openAiCreate=1 signal EmployerPanelComponent already handles
   *  for a new Employer's first setup -- the underlying page is genuinely
   *  the Dashboard (not Jobs), with AI Create opening as an overlay on top
   *  of it, exactly like an existing Employer's "Create a Job" button. */
  postFirstJob(): void {
    this.dialogRef.close('post_job');
    this.router.navigate(['/recruiter/dashboard'], { queryParams: { openAiCreate: '1' } });
  }

  completeProfile(): void {
    this.dialogRef.close('complete_profile');
    this.router.navigate(['/recruiter/company/settings']);
  }

  viewPublicProfile(): void {
    if (this.companySlug) {
      this.dialogRef.close('view_profile');
      window.open('/company/' + this.companySlug, '_blank', 'noopener');
    }
  }

  goToDashboard(): void {
    this.dialogRef.close('dashboard');
    this.router.navigate(['/recruiter/dashboard']);
  }
}
