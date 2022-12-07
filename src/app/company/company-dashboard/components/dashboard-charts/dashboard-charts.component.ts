import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import 'chartjs-adapter-moment';
import { month } from '@app-shared/mock.data';
import moment from "moment";

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
  lineChartRendering: boolean = true;

  // public activityGraphChartLabels: string[] = new Array(7).fill(0).map((el, i) => "September " + i);

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
    datasets: [
      {
        data: [],
        label: 'JobView',
        borderColor: '#35C768',
        pointBackgroundColor: '#35C768',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
      },
      {
        data: [],
        label: 'Job Applicant',
        borderColor: '#FE6F61',
        pointBackgroundColor: '#FE6F61',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(77,83,96,1)',
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
    const { applicants, contacts } = this.details.statistic;

    const data = { data: [parseInt(contacts), parseInt(applicants)] }
    this.doughnutChartData.datasets.push(data);
    this.lineChartRender();
    this.chart?.update();

  }

  lineChartRender(){
    let sortedJobViews = this.details.jobViews?.slice().sort(function(a: any, b: any){
      var c: any = new Date(a.date);
      var d: any = new Date(b.date);
      return c-d;
    });

    let sortedApplicants = this.details.graph?.slice().sort(function(a: any, b: any){
      var c: any = new Date(a.date);
      var d: any = new Date(b.date);
      return c-d;
    });

    let formattedLineChartData = this.formatLineGraphVal(sortedJobViews, sortedApplicants)

    this.lineChartData.datasets[0].data = formattedLineChartData.jobViews; 
    this.lineChartData.datasets[1].data = formattedLineChartData.jobApplicants; 
    this.lineChartData.labels = formattedLineChartData.labels;
    this.lineChartRendering = false;

  }

  getMonth(monthNumber) {
    return this.months[monthNumber + 1];
  }

  formatLineGraphVal(jobViews: any[], jobApplicants: any[]){
    let graphData = {
      labels: [],
      jobViews: [],
      jobApplicants: []
    }

    if(jobViews.length > jobApplicants.length){
      jobViews.forEach(element => {
        graphData.labels.push(moment(element.date).format('MMMM DD YYYY')),
        graphData.jobViews.push(element.count);
        graphData.jobApplicants.push(jobApplicants.find(x => x.date === element.date) ? jobApplicants.find(x => x.date === element.date)['count'] : 0);

      });
    } else {
      jobApplicants.forEach(element => {
        graphData.labels.push(moment(element.date).format('MMMM DD YYYY')),
        graphData.jobViews.push(element.count);
        graphData.jobApplicants.push(jobViews.find(x => x.date === element.date) ? jobViews.find(x => x.date === element.date)['count'] : 0)

      });
    }
    
    return graphData;
  }

}
 