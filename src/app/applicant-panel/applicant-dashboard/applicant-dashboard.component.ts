import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { ApplicantFacade } from '@main/applicant/state/applicant.facade';
import Module from 'module';
import * as Model from '../../applicant/applicant.model';
import { tap } from 'rxjs';

@Component({
  selector: 'app-applicant-dashboard',
  templateUrl: './applicant-dashboard.component.html',
  styleUrls: ['./applicant-dashboard.component.scss'],
  animations: [mainAnimations],
})
export class ApplicantDashboardComponent implements OnInit {
  userId: any;
  applicant: Model.Applicant;

  public isVisible: boolean = false;

  profile$ = this.applicantFacade.applicantDetails$.pipe(
    tap((applicant) => (this.applicant = applicant))
  );

  constructor(private applicantFacade: ApplicantFacade) {}

  ngOnInit(): void {
    var user = JSON.parse(localStorage.getItem('user'));
    this.userId = user._id;
    this.applicantFacade.getApplicantById(this.userId);
    if (!this.applicant) {
      this.isVisible = true;
    }
  }

  closeSnackbar(): void {
    this.isVisible = false;
  }
}
