import { Component, OnInit, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from '../jobs.model';

@Component({
  selector: 'app-job-card-list-view',
  animations: [mainAnimations],
  templateUrl: './job-card-list-view.component.html',
  styleUrls: ['./job-card-list-view.component.scss']
})
export class JobCardListViewComponent implements OnInit {
  @Input() data: Model.BasicJob;
  @Input() i: number;

  constructor() { }

  ngOnInit(): void {
  }

  applyNow(data) {
    //  TODO apply button
  }

}
