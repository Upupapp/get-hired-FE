import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-banner-account-details',
  animations: [mainAnimations],
  templateUrl: './banner-account-details.component.html',
  styleUrls: ['./banner-account-details.component.scss']
})
export class BannerAccountDetailsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
