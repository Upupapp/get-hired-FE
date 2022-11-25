import { Component, Input, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss'],
  animations: [mainAnimations]
})
export class ProfileDetailsComponent implements OnInit {
  @Input() userId: string;


  constructor(

  ) { }

  ngOnInit(): void {
    if(this.userId) {
      // TODO Get user Profile
    }
  }

}
