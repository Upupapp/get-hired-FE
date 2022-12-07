import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-dashboard-statistics',
  templateUrl: './dashboard-statistics.component.html',
  styleUrls: ['./dashboard-statistics.component.scss'],
  animations: [mainAnimations]
})
export class DashboardStatisticsComponent implements OnInit {
  @Input() details: any;
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
          tickColor: '#ffffff',
          borderColor: '#ffffff'
        },
        ticks: {
          color: '#ffffff ' // x axe labels (can be hexadecimal too)
        }
      },
      y: {
        grid: {
          display: false,
          tickColor: '#ffffff',
          borderColor: '#ffffff'
        },
        ticks: {
          color: '#ffffff ' // x axe labels (can be hexadecimal too)
        },
        max: 5,
        min: 0
      }
    },
    plugins: {
      legend: {
        display: false,
      }
    }
  };

  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  ngOnInit(): void {
    this.renderChart()
  }

  renderChart() {
    const cityData = this.details.cities.map(ct => parseInt(ct.count));
    const cityNames = this.details.cities.map(ct => ct.city);

    this.barChartData.labels = cityNames;
    this.barChartData.datasets.push({
      label: 'Top Cities',
      data: cityData,
      backgroundColor: '#ffffff',
      borderColor: '#ffffff'
    })
    this.chart?.update();

  }

}
