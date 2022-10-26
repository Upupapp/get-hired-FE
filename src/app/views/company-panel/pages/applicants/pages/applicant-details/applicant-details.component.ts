import { Component, OnInit } from '@angular/core';
import {
  Applicant,
  applicantLists
} from '../../utils/applicants-model-interface';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {Location } from '@angular/common';

@Component({
  selector: 'app-applicant-details',
  templateUrl: './applicant-details.component.html',
  styleUrls: ['./applicant-details.component.scss']
})
export class ApplicantDetailsComponent implements OnInit {
  public applicantList: Applicant[] = applicantLists;  
  public selectedApplicant: Applicant;
  public id;

  constructor(private router: Router,  
    private route: ActivatedRoute,
    private location: Location) { }

  ngOnInit(): void {
    this.selectedApplicant = this.applicantList.find(el => el?.id == this.route.snapshot.params['id'])
    console.log(this.selectedApplicant)
  }

  goBack(){
    this.location.back();
  }

}
