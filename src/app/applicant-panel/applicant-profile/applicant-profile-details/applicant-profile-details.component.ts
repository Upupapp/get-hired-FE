import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-applicant-profile-details',
  templateUrl: './applicant-profile-details.component.html',
  styleUrls: ['./applicant-profile-details.component.scss']
})
export class ApplicantProfileDetailsComponent implements OnInit {
  user = localStorage.getItem('user');
  userId: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.userId = JSON.parse(this.user)._id;
  }

}
