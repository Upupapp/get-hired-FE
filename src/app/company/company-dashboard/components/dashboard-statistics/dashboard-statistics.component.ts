import { Component, Input, OnInit } from '@angular/core';
import { mainAnimations } from '@main/shared/animations/main-animations';

@Component({
  selector: 'app-dashboard-statistics',
  templateUrl: './dashboard-statistics.component.html',
  styleUrls: ['./dashboard-statistics.component.scss'],
  animations: [mainAnimations]
})
export class DashboardStatisticsComponent implements OnInit {
  @Input() details: any;

  constructor() { }

  ngOnInit(): void {
  }

}
