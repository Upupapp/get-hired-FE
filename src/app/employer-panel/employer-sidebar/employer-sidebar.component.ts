import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeFacade } from '@main/employee/state/employee.facade';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employer-sidebar',
  templateUrl: './employer-sidebar.component.html',
  styleUrls: ['./employer-sidebar.component.scss'],
  animations: [mainAnimations]
})
export class EmployerSidebarComponent implements OnInit {
  private req: Subscription;

  @Input() sidebarWidth;
  employee$ = this.employeeFacade.employeeDetails$;

  public location: any = '';
  public loggedUserData: any = JSON.parse(localStorage.getItem('userData'));

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private employeeFacade: EmployeeFacade) {
    this.req = this.router.events.subscribe((event: any) => {
      this.location = this.router.url;
      this.loggedUserData = JSON.parse(localStorage.getItem('userData'));
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    });
  }

  public sidebarItems: any[] = [
    {
      title: 'Dashboard', icon: 'dashboard.png', class: 'dashboard', route: 'dashboard'
    },

    {
      title: 'Jobs', icon: 'jobs.png', class: 'jobs', route: 'jobs',
      sub_routes: [
        {
          title: 'Job Posts', icon: 'jobs.png', class: 'jobs', route: 'jobs',
        },

        {
          title: 'Expired Jobs',  icon: 'expired-jobs.png', class: 'expired', route: 'expired-jobs'
        },
      ]
    },

    {
      title: 'Applicants', icon: 'applicants.png', class: 'applicants', route: 'applicants',
      sub_routes: [
        {
          title: 'Job Applicants', icon: 'applicants.png', class: 'applicants', route: 'applicants',
        },

        {
          title: 'Contact List',  icon: 'contact-list.png', class: 'contact-list', route: 'applicants/contact-list'
        },
      ]
    },

    {
      title: 'Interview Settings', icon: 'create-interview.png', class: 'interviews', route: 'interview-settings'
    },

    {
      title: 'My Subscription', icon: 'subscribe.png', class: 'subscription', route: 'my-subscription'
    },

    {
      title: 'Company Details', icon: 'account.png', class: 'accounts', route: 'company-details'
    },
  ]

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if(this.req) this.req.unsubscribe();
  }

  changeRoute(route){
    this.router.navigate([route]);
  }
}
