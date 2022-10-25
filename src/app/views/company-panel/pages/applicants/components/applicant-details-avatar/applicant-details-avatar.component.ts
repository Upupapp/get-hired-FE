import { Component, OnInit, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-applicant-details-avatar',
  animations: [mainAnimations],
  templateUrl: './applicant-details-avatar.component.html',
  styleUrls: ['./applicant-details-avatar.component.scss']
})
export class ApplicantDetailsAvatarComponent implements OnInit {
  @Input() selectedApplicant;
  
  constructor() { }

  ngOnInit(): void {
  }
}
