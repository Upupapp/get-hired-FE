import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { AdminService } from '@app-shared/services/auth/admin/admin.service';
import { Subscription } from 'rxjs';
import { 
  Router, 
  ActivatedRoute 
} from '@angular/router';

@Component({
  selector: 'app-applicant-stat-chart',
  animations: [mainAnimations],
  templateUrl: './stat-chart.component.html',
  styleUrls: ['./stat-chart.component.scss']
})
export class StatChartComponent implements OnInit {
  public activityGraphChartLabels: string[] = new Array(7).fill(0).map((el, i) => "September " + i);
  
  /* Stacked Graph CHART */
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
        //activity: true,
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

  public activityGraphChartData: any[] = [
    {
      type: 'line',
      pointBorderWidth: 0,
      pointBackgroundColor: 'rgba(239,162,13, 1)',
      pointStyle: 'crossRot',
      tension: 0.3,
      label: 'Hired',
      barThickness: 25,
      borderRadius: 5,
      data: [22, 14, 17, 15, 14, 18, 12, 22, 14, 17, 15, 14, 18, 12],
      hoverBackgroundColor: 'rgba(239,162,13, 1)',
      backgroundColor: 'rgba(239,162,13, 0.2)',
      borderColor: 'rgba(239,162,13, 0.7)',
      fill: true,
      //borderDash: [10,7]
    },

    {
      label: 'Profile View',
      barThickness: 25,
      borderRadius: 5,
      data: [25, 15, 13, 22, 7, 11, 20],
      hoverBackgroundColor: 'rgba(53, 199, 104, 0.8)',
      backgroundColor: 'rgba(53, 199, 104, 1)',
      borderColor: 'rgba(53, 199, 104, 1)',
    },
    
    {
      label: 'Job Applicantion',
      barThickness: 25,
      borderRadius: 5,
      data: [35,10, 20, 21, 10, 10, 15],
      hoverBackgroundColor: 'rgba(254, 111, 97, 0.8)',
      backgroundColor: 'rgba(254, 111, 97, 1)',
      borderColor: 'rgba(254, 111, 97, 1)',
    },

    
  ];
  

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
  public doughnutChartData: any[] = [
    { 
      label: 'Invites',
      data: [75, 84, 45],
      backgroundColor: [
        'rgba(9,201,134, 1)',
        'rgba(254,116,43, 1)',
        'rgba(239,162,13, 1)'
      ],
      hoverBackgroundColor: [
        'rgba(9,201,134, 0.5)',
        'rgba(254,116,43, 0.5)',
        'rgba(239,162,13, 0.5)'

      ],
      borderWidth: [0, 0],
      hoverOffset: 6,
      borderJoinStyle: 'miter',
      borderAlign: 'center',
      offset: [0, 3, 11],
      cutout: ['70%', '75%', '40%'],
      //weight: [5, 1, 1, 1],
      //radius: '45%',
      //circumference: 45,  
      animation: {
        animateRotate: true,
      },
      //clip: {left: 5, top: false, right: -2, bottom: 0},
      spacing: 0
    },

  ];
  public doughnutChartLabels: string[] = ['Interviewed'];

    

  constructor() { }

  ngOnInit(): void {
  }

}
