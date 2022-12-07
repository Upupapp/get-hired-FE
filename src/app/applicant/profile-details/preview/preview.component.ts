import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {
  profile$ = this.applicantFacade.applicantDetails$;

  constructor(
    private applicantFacade: ApplicantFacade,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
  }

  redirectToEdit(){
    this.router.navigateByUrl('user/profile/edit')
  }
}
