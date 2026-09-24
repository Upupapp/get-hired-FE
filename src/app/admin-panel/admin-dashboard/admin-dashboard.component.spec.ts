import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MockStore } from '@ngrx/store/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminTimeFilterComponent } from '../admin-time-filter/admin-time-filter.component';
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

  it('shows Pageviews (fixture) directly above the visits number', () => {
    const store = TestBed.inject(MockStore);
    store.setState({
      admin: {
        selected: null,
        list: [],
        error: null,
        succesMsg: null,
        loading: false,
        user: null,
        dashboardLoading: false,
        dashboardError: null,
        dashboard: {
          usersTotal: 3,
          jobseekersTotal: 1,
          employersTotal: 1,
          adminsTotal: 1,
          jobsActive: 2,
          jobsTotal: 4,
          applications7d: 0,
          applications30d: 5,
          companiesTotal: 1,
          range: '7d',
          from: '2026-09-17',
          to: '2026-09-24',
          visitsTotal: 1280,
          visitsPrevious: 1100,
          visitsSeries: [{ date: '2026-09-24', count: 1280 }],
          visitsMetricLabel: 'Pageviews (fixture)',
          applicationsInRange: 0,
          applicationsInRangeFixture: false,
          fixtureMode: 'fixture',
        },
      },
    });
    fixture.detectChanges();

    const metric = fixture.nativeElement.querySelector('.admin-visits-metric');
    const value = fixture.nativeElement.querySelector('.admin-visits-value');
    expect(metric.textContent.trim()).toBe('Pageviews (fixture)');
    expect(metric.nextElementSibling).toBe(value);
    expect(getComputedStyle(metric).textTransform).toBe('none');
    expect(value.textContent).toContain('1,280');
  });
});
