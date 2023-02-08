import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { LoadingComponent } from '@app-shared/components/loading/loading.component';
import { ApplicantFacade } from '../state/applicant.facade';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss'],
  animations: [mainAnimations]
})
export class ProfileDetailsComponent implements OnInit {
  @Input() userId: string;
  @Input() isApplicantView: boolean;

  pageLoad$ = this.applicantFacade.loading$
    .pipe().subscribe(this.formLoading.bind(this));

  profile$ = this.applicantFacade.applicantDetails$;

  constructor(
    private applicantFacade: ApplicantFacade,
    private loadingDialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if(this.userId) {
      this.applicantFacade.getApplicantById(this.userId);
    }
  }

  redirectToEdit(){
    this.router.navigate(['../edit'], { relativeTo: this.route})
  }

  formLoading(loading: boolean) {
    if (loading) {
      const ref = this.loadingDialog.open(LoadingComponent, {
        disableClose: true,
        data: {
          selfClose: false
        }
      });
    } else{
      setTimeout(() => this.loadingDialog.closeAll(), 2000);
    }
  }

}
