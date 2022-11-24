import { Component, OnInit } from '@angular/core';
import { CoreService } from '@app-core/services/core.service';
import { AuthFacade } from '@main/auth/state/auth.facade';
import { tap } from 'rxjs';

@Component({
  selector: 'app-applicant-panel',
  templateUrl: './applicant-panel.component.html',
  styleUrls: ['./applicant-panel.component.scss']
})
export class ApplicantPanelComponent implements OnInit {
  fullName = 'Aryhan Coyco';
  isUserLoggedIn: boolean;

  applicant$ = this.authFacade.credentials$
    .pipe(
      tap(user => console.log(user))
    );

  constructor(
    private authFacade: AuthFacade,
    private coreService: CoreService
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.coreService.isLoggedIn();
  }

}
