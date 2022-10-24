import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-documents',
  animations: [mainAnimations],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
