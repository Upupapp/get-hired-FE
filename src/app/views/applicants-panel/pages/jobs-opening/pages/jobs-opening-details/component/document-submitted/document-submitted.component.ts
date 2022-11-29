import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-document-submitted',
  animations: [mainAnimations],
  templateUrl: './document-submitted.component.html',
  styleUrls: ['./document-submitted.component.scss']
})
export class DocumentSubmittedComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
