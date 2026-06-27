import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router, RouterEvent } from '@angular/router';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { HapticFeedbackService } from '@main/shared/services/haptic-feedback/haptic-feedback.service';

@Component({
  selector: 'app-company-not-setup',
  templateUrl: './company-not-setup.component.html',
  styleUrls: ['./company-not-setup.component.scss'],
  animations: [mainAnimations]
})
export class CompanyNotSetupComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<CompanyNotSetupComponent>,
    private router: Router,
    private haptics: HapticFeedbackService
  ) { }

  ngOnInit(): void {
  }

  redirectToSetup() {
    this.haptics.selection();
    this.dialogRef.close();
    this.router.navigate(['/recruiter/company/settings']);
  }

}
