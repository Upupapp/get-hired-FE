import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-reusable-org-chart',
  templateUrl: './reusable-org-chart.component.html',
  styleUrls: ['./reusable-org-chart.component.scss']
})
export class ReusableOrgChartComponent implements OnInit {
  @Input() nodes: any = [];

  constructor() { }

  ngOnInit(): void {
  }

  test(event){
    console.log(event)
  }

}
