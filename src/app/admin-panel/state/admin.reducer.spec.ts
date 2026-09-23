import { adminDashboard, adminDashboardFail, adminDashboardSuccess } from './admin.actions';
import { adminReducer } from './admin.reducer';
import { Dashboard } from '../admin.model';

describe('adminReducer dashboard', () => {
  const dashboard: Dashboard = {
    usersTotal: 3,
    jobseekersTotal: 1,
    employersTotal: 1,
    adminsTotal: 1,
    jobsActive: 2,
    jobsTotal: 4,
    applications7d: 0,
    applications30d: 5,
    companiesTotal: 1,
  };

  it('uses distinct action types so a success does not re-trigger the load effect', () => {
    expect(adminDashboard.type).toBe('[admin] - Get admin status Dashboard');
    expect(adminDashboardSuccess.type).toBe('[admin] -Get admin Success Dashboard');
    expect(adminDashboardFail.type).toBe('[admin] - Get admin Fail Dashboard');
    expect(adminDashboard.type).not.toBe(adminDashboardSuccess.type);
    expect(adminDashboard.type).not.toBe(adminDashboardFail.type);
  });

  it('stores KPIs on their own loading and error flags', () => {
    const requested = adminReducer(undefined, adminDashboard());
    expect(requested.dashboardLoading).toBeTrue();
    expect(requested.dashboardError).toBeNull();
    expect(requested.loading).toBeFalse();

    const loaded = adminReducer(requested, adminDashboardSuccess({ dashboard }));
    expect(loaded.dashboardLoading).toBeFalse();
    expect(loaded.dashboard).toEqual(dashboard);

    const empty = adminReducer(requested, adminDashboardSuccess({ dashboard: null }));
    expect(empty.dashboard).toBeNull();
    expect(empty.dashboardError).toBeNull();

    const failed = adminReducer(requested, adminDashboardFail({ payload: 'Could not load the dashboard.' }));
    expect(failed.dashboardLoading).toBeFalse();
    expect(failed.dashboardError).toBe('Could not load the dashboard.');
    expect(failed.loading).toBeFalse();
  });
});
