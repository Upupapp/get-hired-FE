import { Component, OnInit, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-applicant-details-main',
  animations: [mainAnimations],
  templateUrl: './applicant-details-main.component.html',
  styleUrls: ['./applicant-details-main.component.scss']
})
export class ApplicantDetailsMainComponent implements OnInit {
  @Input() selectedApplicant;
  
  
  constructor() { }

  ngOnInit(): void {
  }


}
