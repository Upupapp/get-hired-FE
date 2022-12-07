import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { ApplicantFacade } from '@main/applicant/state/applicant.facade';
import { tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import * as Model from '@main/applicant/applicant.model';

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
    tap((applicant) => {
      if(applicant) {
        this.applicant = applicant
        this.isVisible = true;
      }
    })
  );

  constructor(
    private applicantFacade: ApplicantFacade,
    private router: Router,
    private route: ActivatedRoute
    ) {}

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

  redirectToEdit(){
    this.router.navigate(['../profile/edit'], { relativeTo: this.route})
  }
}
