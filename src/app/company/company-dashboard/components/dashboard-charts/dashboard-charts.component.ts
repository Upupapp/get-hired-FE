import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

export interface AnalyticsSeries {
  date: string;
  views: number;
  applications: number;
}

export interface DashboardAnalytics {
  range: { key: string; label: string };
  summary: {
    views: { value: number; delta: number | null; deltaLabel: string | null; trend: string; previousValue: number };
    applications: { value: number; delta: number | null; deltaLabel: string | null; trend: string; previousValue: number };
    conversionRate: { value: number | null; label: string; state: string };
    activeJobs: { value: number };
  };
  series: AnalyticsSeries[];
  insight: { severity: string; title: string; body: string };
  jobPerformance: Array<{
    jobId: string;
    title: string;
    status: string;
    views: number;
    applications: number;
    conversionRate: string;
    newApplicants: number;
    nextAction: { label: string; url: string; reason: string };
  }>;
}

@Component({
  selector: 'app-dashboard-charts',
  templateUrl: './dashboard-charts.component.html',
  styleUrls: ['./dashboard-charts.component.scss'],
  animations: [mainAnimations],
})
export class DashboardChartsComponent implements OnInit, OnChanges {
  @Input() analytics: DashboardAnalytics | null = null;
  @Input() loading = false;
  @Input() error = false;
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  // Chart.js config — clean, accessible, GetHired brand colors
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    elements: { line: { tension: 0.35, borderWidth: 2 }, point: { radius: 3, hitRadius: 10 } },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#6b7280',
          font: { size: 11, family: 'Manrope' },
          maxTicksLimit: 8,
          maxRotation: 0,
        },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: {
          color: '#6b7280',
          font: { size: 11, family: 'Manrope' },
          precision: 0,
        },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#e2e8f0',
        bodyColor: '#cbd5e1',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return ` ${label}: ${value}`;
          },
        },
      },
    },
  };

  public chartType: any = 'line';

  public chartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Views',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.08)',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3b82f6',
        fill: true,
      },
      {
        data: [],
        label: 'Applications',
        borderColor: '#FF7062',
        backgroundColor: 'rgba(255,112,98,0.08)',
        pointBackgroundColor: '#FF7062',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#FF7062',
        fill: true,
      },
    ],
    labels: [],
  };

  get totalViews(): number {
    return this.analytics && this.analytics.summary ? (this.analytics.summary.views.value || 0) : 0;
  }
  get totalApplications(): number {
    return this.analytics && this.analytics.summary ? (this.analytics.summary.applications.value || 0) : 0;
  }
  get conversionLabel(): string {
    return this.analytics && this.analytics.summary && this.analytics.summary.conversionRate
      ? (this.analytics.summary.conversionRate.label || '—')
      : '—';
  }
  get viewsDelta(): string | null {
    return this.analytics && this.analytics.summary && this.analytics.summary.views
      ? (this.analytics.summary.views.deltaLabel || null)
      : null;
  }
  get appsDelta(): string | null {
    return this.analytics && this.analytics.summary && this.analytics.summary.applications
      ? (this.analytics.summary.applications.deltaLabel || null)
      : null;
  }
  get viewsTrend(): string {
    return this.analytics && this.analytics.summary && this.analytics.summary.views
      ? (this.analytics.summary.views.trend || 'flat')
      : 'flat';
  }
  get appsTrend(): string {
    return this.analytics && this.analytics.summary && this.analytics.summary.applications
      ? (this.analytics.summary.applications.trend || 'flat')
      : 'flat';
  }
  get insightSeverity(): string {
    return this.analytics && this.analytics.insight ? (this.analytics.insight.severity || 'info') : 'info';
  }
  get insightTitle(): string {
    return this.analytics && this.analytics.insight ? (this.analytics.insight.title || '') : '';
  }
  get insightBody(): string {
    return this.analytics && this.analytics.insight ? (this.analytics.insight.body || '') : '';
  }
  get hasActivity(): boolean {
    return this.totalViews > 0 || this.totalApplications > 0;
  }

  // Screen reader text summary
  get ariaChartSummary(): string {
    if (!this.analytics) { return 'No analytics data.'; }
    return `Chart showing job views and applications over the last ${this.analytics.range ? this.analytics.range.label : 'period'}. ` +
      `Total views: ${this.totalViews}. Total applications: ${this.totalApplications}. Conversion: ${this.conversionLabel}.`;
  }

  constructor() {}

  ngOnInit(): void {
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['analytics']) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    const series = this.analytics && this.analytics.series ? this.analytics.series : [];
    const labels: string[] = [];
    const viewsData: number[] = [];
    const appsData: number[] = [];

    for (let i = 0; i < series.length; i++) {
      const point = series[i];
      const d = new Date(point.date);
      const month = d.toLocaleString('en-US', { month: 'short' });
      const day = d.getDate();
      labels.push(month + ' ' + day);
      viewsData.push(point.views || 0);
      appsData.push(point.applications || 0);
    }

    this.chartData = {
      ...this.chartData,
      labels,
      datasets: [
        { ...this.chartData.datasets[0], data: viewsData },
        { ...this.chartData.datasets[1], data: appsData },
      ],
    };

    if (this.chart) {
      this.chart.update();
    }
  }
}
