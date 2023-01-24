import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import 'chartjs-adapter-moment';
import { month } from '@app-shared/mock.data';
import { format } from 'date-fns';
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
      y: { 
        position: 'left',
      },

      x: {
        grid: {
           display:false
        }, 
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

  public activityGraphChartType: any = 'bar';
  public activityGraphChartLegend = false;

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Job Views',
        borderColor: '#95B52E',
        backgroundColor: '#95B52E',
        hoverBackgroundColor: 'rgba(149, 181, 46, 0.8)',
        pointBackgroundColor: '#95B52E',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(149, 181, 46, 1)',
      },
      {
        data: [],
        label: 'Job Applicant',
        borderColor: '#407700',
        backgroundColor: '#407700',
        hoverBackgroundColor: 'rgba(64, 119, 0, 0.8)',
        pointBackgroundColor: '#407700',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(64, 119, 0, 1)',
      },
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

    const data = { 
      data: [parseInt(contacts), parseInt(applicants)], 
      backgroundColor: [
        'rgba(4, 102, 69, 1)',
        'rgba(0, 160, 100, 0.5)',
        '#f6f6f6'
      ],
      hoverBackgroundColor: [
        'rgba(4, 102, 69, 1)',
        'rgba(0, 160, 100, 0.5)',
        '#f6f6f6'
      ],
      hoverOffset: 4,
      //offset: [0, 3, 11],
      //cutout: ['70%', '75%', '40%']
    }
    this.doughnutChartData.datasets.push(data);
    this.lineChartRender();
    this.chart?.update();

  }

  lineChartRender(){
    let sortedJobViews = this.details.jobViews?.slice(/*4,19*/).sort(function(a: any, b: any){
      var c: any = new Date(a.date);
      var d: any = new Date(b.date);
      return c-d;
    });

    let sortedApplicants = this.details.graph?.slice(/*4,19*/).sort(function(a: any, b: any){
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
        graphData.labels.push(moment(element.date).format('MMM DD')),
        graphData.jobViews.push(element.count);
        graphData.jobApplicants.push(jobApplicants.find(x => x.date === element.date) ? jobApplicants.find(x => x.date === element.date)['count'] : 0);

      });
    } else {
      jobApplicants.forEach(element => {
        graphData.labels.push(moment(element.date).format('MMM DD')),
        graphData.jobViews.push(element.count);
        graphData.jobApplicants.push(jobViews.find(x => x.date === element.date) ? jobViews.find(x => x.date === element.date)['count'] : 0)

      });
    }
    
    return graphData;
  }

}
 