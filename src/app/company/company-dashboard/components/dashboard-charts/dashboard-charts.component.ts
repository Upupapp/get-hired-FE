import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import 'chartjs-adapter-moment';
import { month } from '@app-shared/mock.data';

@Component({
  selector: 'app-dashboard-charts',
  templateUrl: './dashboard-charts.component.html',
  styleUrls: ['./dashboard-charts.component.scss'],
  animations: [mainAnimations],
})
export class DashboardChartsComponent implements OnInit {
  @Input() details: any;
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  months = month;

  // public activityGraphChartLabels: string[] = new Array(7).fill(0).map((el, i) => "September " + i);

  public activityGraphChartOptions: any = {
    indexAxis: 'x',
    plugins: {
      title: {
        //display: true,
        //text: 'Chart.js Bar Chart - Stacked'
      },
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          boxHeight: 12,
          fontColor: '#333',
          //pointStyle: 'circle',
          //usePointStyle: true,
          padding: 10,
          font: {
            family: 'Noto Sans'
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day'
        },
        grid: {
          display: false
        },
      },
      y: {
        //activity: true,
        grid: {
          display: true,
          borderDash: [8, 4],
        },
      }
    }
  };

  public activityGraphChartType: any = 'bar';
  public activityGraphChartLegend = false;

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'JobView',
        backgroundColor: 'rgba(148,159,177,0.2)',
        borderColor: 'rgba(148,159,177,1)',
        pointBackgroundColor: 'rgba(148,159,177,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
        fill: 'origin',
      },
      {
        data: [],
        label: 'Job Applicant',
        backgroundColor: 'rgba(77,83,96,0.2)',
        borderColor: 'rgba(77,83,96,1)',
        pointBackgroundColor: 'rgba(77,83,96,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(77,83,96,1)',
        fill: 'origin',
      }
    ],
    labels: [ ]
  };


  /* PIE CHART */
  public doughnutChartOptions: any = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          fontColor: '#333',
          fontSize: 15,
          pointStyle: 'circle',
          usePointStyle: true,
          padding: 25,
          font: {
            size: 15,
            family: 'Manrope'
          }
        }
      },
    },
    maintainAspectRatio: false,
  };
  public doughnutChartLabels: string[] = ['Contacts', 'Applicants'];
  public doughnutChartType: any = 'doughnut';
  public doughnutChartLegend = true;
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: this.doughnutChartLabels,
    datasets: []
  };

  constructor() { }

  ngOnInit(): void {
    console.log(this.details);
    const { applicants, contacts } = this.details.statistic;

    const data = { data: [parseInt(contacts), parseInt(applicants)] }
    this.doughnutChartData.datasets.push(data);
    this.lineChartRender();
    this.chart?.update();

  }

  lineChartRender(){
    const count = this.details.graph.map(cnt => parseInt(cnt.count));
    const data = { data: [count] };
    const mappedLabels = this.details.graph.map(cnt => this.getMonth(cnt.month));
    this.lineChartData.datasets.push(data);
    this.lineChartData.labels.push(mappedLabels);
    this.chart?.update();

  }

  getMonth(monthNumber) {
    return this.months[monthNumber + 1];
  }

}
