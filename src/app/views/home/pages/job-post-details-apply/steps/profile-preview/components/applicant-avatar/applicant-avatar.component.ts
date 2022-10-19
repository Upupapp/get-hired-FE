import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-applicant-avatar',
  animations: [mainAnimations],
  templateUrl: './applicant-avatar.component.html',
  styleUrls: ['./applicant-avatar.component.scss']
})
export class ApplicantAvatarComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
