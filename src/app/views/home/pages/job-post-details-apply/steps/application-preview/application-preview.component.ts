import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-application-preview',
  animations: [mainAnimations],
  templateUrl: './application-preview.component.html',
  styleUrls: ['./application-preview.component.scss']
})
export class ApplicationPreviewComponent implements OnInit {
  public profileSummary: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

  viewMore(){
    this.profileSummary = !this.profileSummary
  }
}
