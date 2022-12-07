import { Component, Input, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Router } from '@angular/router';
import * as Model from '@main/applicant/applicant.model';
import { month } from '@app-shared/mock.data';

@Component({
  selector: 'app-applicant-details',
  animations: [mainAnimations],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  @Input() user: Model.Applicant;

  months = month;

  constructor(public router: Router) { }

  ngOnInit(): void {
  }

  navigateToEdit(){
    sessionStorage.setItem('profile-update', '3');
    this.router.navigate(['/user/profile/edit'])
  }

}
