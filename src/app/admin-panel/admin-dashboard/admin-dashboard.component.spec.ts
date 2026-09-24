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
});
