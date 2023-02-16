import { Component, Input, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { AdminService } from '@app-shared/services/auth/admin/admin.service';
import { Subscription } from 'rxjs';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import { ChartConfiguration, ChartData } from 'chart.js';
import { month } from '@app-shared/mock.data';
import moment from 'moment';

@Component({
  selector: 'app-applicant-stat-chart',
  animations: [mainAnimations],
  templateUrl: './stat-chart.component.html',
  styleUrls: ['./stat-chart.component.scss']
})
export class StatChartComponent implements OnInit {
  @Input() charts: any;
  public activityGraphChartLabels: string[] = new Array(7).fill(0).map((el, i) => "December " + (i + 1));
  months = month;
  lineChartRendering: boolean = true;

  /* Stacked Graph CHART */
  public activityGraphChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0.5
      }
    },
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      y:
      {
        position: 'left',
      },
    },

    plugins: {
      legend: { display: true },
      annotation: {
        annotations: [
          {
            type: 'line',
            scaleID: 'x',
            value: 'March',
            borderColor: 'orange',
            borderWidth: 2,
            label: {
              display: true,
              position: 'center',
              color: 'orange',
              content: 'LineAnno',
              font: {
                weight: 'bold'
              }
            }
          },
        ],
      }
    }
  };

  public activityGraphChartType: any = 'line';
  public activityGraphChartLegend = false;

  public lineChartData: ChartConfiguration['data'] = {
    // {
      //   data: [],
      //   label: 'Job View',
      //   backgroundColor: 'rgba(148,159,177,0.2)',
      //   borderColor: 'rgba(148,159,177,1)',
      //   pointBackgroundColor: 'rgba(148,159,177,1)',
      // }
    datasets: [
      {
        data: [],
        label: 'Profile View',
        borderColor: '#35C768',
        pointBackgroundColor: '#35C768',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
      },
      {
        data: [],
        label: 'Job Application',
        borderColor: '#FE6F61',
        pointBackgroundColor: '#FE6F61',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(77,83,96,1)',
      }
    ],
    labels: []
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

  public doughnutChartType: any = 'doughnut';
  public doughnutChartLegend = true;
  public doughnutChartLabels: string[] = ['Application', 'Interviewed'];

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: this.doughnutChartLabels,
    datasets: [],

  };

  constructor() { }

  ngOnInit(): void {
    console.log(this.charts);
    const data = { data: [parseInt(this.charts.application), parseInt(this.charts.interviews)] }
    this.doughnutChartData.datasets.push(data);
    this.lineChartRender();
    console.log()
    // this.chart?.update();
  }

  lineChartRender() {
    let sortedProfileView = this.charts.profileView?.slice().sort(function (a: any, b: any) {
      var c: any = new Date(a.date);
      var d: any = new Date(b.date);
      return c - d;
    });

    let sortedJobApplication = this.charts.jobApplication?.slice().sort(function (a: any, b: any) {
      var c: any = new Date(a.date);
      var d: any = new Date(b.date);
      return c - d;
    });

    let formattedLineChartData = this.formatLineGraphVal(sortedProfileView, sortedJobApplication)

    this.lineChartData.datasets[0].data = formattedLineChartData.profileViews;
    this.lineChartData.datasets[1].data = formattedLineChartData.jobApplications;
    this.lineChartData.labels = formattedLineChartData.labels;
    this.lineChartRendering = false;

  }

  getMonth(monthNumber) {
    return this.months[monthNumber + 1];
  }

  formatLineGraphVal(profileViews: any[], jobApplications: any[]) {
    let graphData = {
      labels: [],
      profileViews: [],
      jobApplications: []
    }

    if (profileViews.length > jobApplications.length) {
      profileViews.forEach(element => {
        graphData.labels.push(moment(element.date).format('MMM DD')),
          graphData.profileViews.push(element.count);
        graphData.jobApplications.push(jobApplications.find(x => x.date === element.date) ? jobApplications.find(x => x.date === element.date)['count'] : 0);

      });
    } else {
      jobApplications.forEach(element => {
        graphData.labels.push(moment(element.date).format('MMM DD')),
          graphData.profileViews.push(element.count);
        graphData.jobApplications.push(profileViews.find(x => x.date === element.date) ? profileViews.find(x => x.date === element.date)['count'] : 0)

      });
    }

    return graphData;
  }

}
