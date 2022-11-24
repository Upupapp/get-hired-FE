import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-applicant-profile-details',
  templateUrl: './applicant-profile-details.component.html',
  styleUrls: ['./applicant-profile-details.component.scss']
})
export class ApplicantProfileDetailsComponent implements OnInit {
  userId: string;

  constructor() { }

  ngOnInit(): void {
  }

}
