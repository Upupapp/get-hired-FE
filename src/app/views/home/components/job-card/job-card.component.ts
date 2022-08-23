import { Component, OnInit, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-job-card',
  animations: [mainAnimations],
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.scss']
})
export class JobCardComponent implements OnInit {
  @Input() data: any;
  @Input() i: number;

  constructor() { }

  ngOnInit(): void {
  }

}
