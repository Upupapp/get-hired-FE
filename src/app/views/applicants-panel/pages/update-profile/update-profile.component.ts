import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-update-profile',
  animations: [mainAnimations],
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss']
})
export class UpdateProfileComponent implements OnInit {
  public stepperItems: any[] = [
    {
      id: 1,
      title: "Profile Details",
      valid: true
    },

    {
      id: 2,
      title: "Skills and Experience",
      valid: true
    },

    {
      id: 3,
      title: "Documents",
      valid: true
    },
  ];

  public stepper: number = 1;

  constructor() { }

  ngOnInit(): void {
  }

  changeStep(step: number): void {
    this.stepper = step;

  }
}
