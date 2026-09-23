import { Component, OnInit } from '@angular/core';
import { AdminFacade } from '../state/admin.facade';
import { Dashboard } from '../admin.model';

interface DashboardCard {
  label: string;
  value: number | null;
  hint: string;
  link: string | null;
  query?: Record<string, string>;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  loading$ = this.adminFacade.dashboardLoading$;
  error$ = this.adminFacade.dashboardError$;
  dashboard$ = this.adminFacade.dashboard$;

  constructor(private adminFacade: AdminFacade) {}

  ngOnInit(): void {
    this.adminFacade.getAdminDashboard();
  }

  retry(): void {
    this.adminFacade.getAdminDashboard();
  }

  cardsFor(dash: Dashboard): DashboardCard[] {
    return [
      { label: 'Users', value: dash.usersTotal, hint: 'All accounts', link: '/admin/users' },
      { label: 'Jobseekers', value: dash.jobseekersTotal, hint: 'Jobseeker accounts', link: '/admin/users', query: { role: '3' } },
      { label: 'Employers', value: dash.employersTotal, hint: 'Employer accounts', link: '/admin/users', query: { role: '2' } },
      { label: 'Admins', value: dash.adminsTotal, hint: 'Admin accounts', link: '/admin/users', query: { role: '1' } },
      { label: 'Active jobs', value: dash.jobsActive, hint: 'Published listings', link: '/admin/jobs', query: { status: 'published' } },
      { label: 'Jobs', value: dash.jobsTotal, hint: 'All listings', link: '/admin/jobs' },
      { label: 'Applications, 7 days', value: dash.applications7d, hint: 'Submitted in the last week', link: null },
      { label: 'Applications, 30 days', value: dash.applications30d, hint: 'Submitted in the last month', link: null },
      { label: 'Companies', value: dash.companiesTotal, hint: 'Employer companies', link: '/admin/companies' },
    ];
  }
}
