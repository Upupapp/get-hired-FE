import { Component, Input, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Router } from '@angular/router';
import * as Model from '@main/applicant/applicant.model';
import { month } from '@app-shared/mock.data';
import { CoreService } from '@app-core/services/core.service';

@Component({
  selector: 'app-applicant-details',
  animations: [mainAnimations],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  @Input() user: Model.Applicant;
  @Input() isApplicantView: boolean;

  months = month;
  userRole: string;

  constructor(
    public router: Router,
    private coreService: CoreService
  ) { }

  ngOnInit(): void {
    this.coreService.getRole()
      .then(role => this.userRole = role);
  }

  navigateToEdit(){
    sessionStorage.setItem('profile-update', '3');
    this.router.navigate(['/user/profile/edit'])
  }

}
