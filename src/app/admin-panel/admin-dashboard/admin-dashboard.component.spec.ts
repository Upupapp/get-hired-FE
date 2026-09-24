import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MockStore } from '@ngrx/store/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminTimeFilterComponent } from '../admin-time-filter/admin-time-filter.component';
import { Dashboard } from '../admin.model';
import { configureComponentTestingModule } from '../../../testing/component-harness';

describe('AdminDashboardComponent', () => {
  let fixture: ComponentFixture<AdminDashboardComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [AdminDashboardComponent, AdminTimeFilterComponent],
      imports: [CommonModule],
    }).compileComponents();
  });

  beforeEach(() => {
    const store = TestBed.inject(MockStore);
    store.setState({
      admin: {
        selected: null,
        list: [],
        error: null,
        succesMsg: null,
        loading: false,
        user: null,
        dashboard: null,
        dashboardLoading: true,
        dashboardError: null,
      }
    });
    fixture = TestBed.createComponent(AdminDashboardComponent);
    fixture.detectChanges();
  });

  it('shows the visits toolbar and keeps Last 7 days as the default range', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Dashboard');
    expect(text).toContain('Last 7 days');
    expect(text).toContain('lifetime');
    const pressed = fixture.nativeElement.querySelector('[aria-pressed="true"]');
    expect(pressed.textContent).toContain('Last 7 days');
  });

  it('shows Pageviews (fixture) beside the visits total', () => {
    const store = TestBed.inject(MockStore);
    const dashboard: Dashboard = {
      usersTotal: 85,
      jobseekersTotal: 32,
      employersTotal: 51,
      adminsTotal: 2,
      jobsActive: 12,
      jobsTotal: 15,
      applications7d: 4,
      applications30d: 11,
      companiesTotal: 17,
      range: '7d',
      from: '2026-09-17',
      to: '2026-09-23',
      visitsTotal: 1683,
      visitsPrevious: 2035,
      visitsSeries: [{ date: '2026-09-17', count: 240 }],
      visitsMetricLabel: 'Pageviews (fixture)',
      applicationsInRange: 4,
      applicationsInRangeFixture: false,
      fixtureMode: 'mixed',
    };
    store.setState({
      admin: {
        selected: null,
        list: [],
        error: null,
        succesMsg: null,
        loading: false,
        user: null,
        dashboard,
        dashboardLoading: false,
        dashboardError: null,
      }
    });
    fixture.detectChanges();

    const figure = fixture.nativeElement.querySelector('.admin-visits-figure');
    const metric = figure.querySelector('.admin-visits-metric');
    const value = figure.querySelector('.admin-visits-value');
    expect(value.textContent.replace(/\s/g, '')).toContain('1,683');
    expect(metric.textContent.trim()).toBe('Pageviews (fixture)');
    expect(fixture.nativeElement.querySelector('.admin-visits-kicker')).toBeNull();
  });
});
