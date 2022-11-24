import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-applicant-dashboard',
  templateUrl: './applicant-dashboard.component.html',
  styleUrls: ['./applicant-dashboard.component.scss'],
  animations: [mainAnimations]
})
export class ApplicantDashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
