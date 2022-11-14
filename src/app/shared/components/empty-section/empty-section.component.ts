import { Component, OnInit, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-empty-section',
  animations: [mainAnimations],
  templateUrl: './empty-section.component.html',
  styleUrls: ['./empty-section.component.scss']
})
export class EmptySectionComponent implements OnInit {
  @Input() detailSize = 'large';
  @Input() search: boolean = false;
  @Input() title: string = 'Title';
  @Input() subTitle: string = '';

  constructor() { }

  ngOnInit(): void {
  }

}
