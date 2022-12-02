import { Component, OnInit } from '@angular/core';
import { CoreService } from '@app-core/services/core.service';
import { ApplicantFacade } from '@main/applicant/state/applicant.facade';
import { AuthFacade } from '@main/auth/state/auth.facade';
import { initializeApp } from 'firebase/app';
import { tap } from 'rxjs';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-applicant-panel',
  templateUrl: './applicant-panel.component.html',
  styleUrls: ['./applicant-panel.component.scss']
})
export class ApplicantPanelComponent implements OnInit {
  fullName = 'GetHired Applicant';
  isUserLoggedIn: boolean;
  local = JSON.parse(localStorage.getItem('user'));
  user$ = this.applicantFacade.user$;

  constructor(
    private coreService: CoreService,
    private applicantFacade: ApplicantFacade
  ) { }

  ngOnInit(): void {
    const app = initializeApp(environment.firebase);
    // const auth = getAuth(app);

    this.isUserLoggedIn = this.coreService.isLoggedIn();
    this.applicantFacade.getUser(this.local._id)
  }

}

