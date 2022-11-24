import { Component, Input, OnInit, HostListener } from '@angular/core';
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
  public screenHeight: number = 300;

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
      title: 'Jobs', icon: 'jobs.png', class: 'jobs',
      route: 'jobs',
      sub_routes: [
        {
          title: 'Job Posts', icon: 'jobs.png', class: 'jobs', route: 'jobs/list',
        },

        {
          title: 'Expired Jobs',  icon: 'expired-jobs.png', class: 'expired', route: 'jobs/expired'
        },
      ]
    },

    {
      title: 'Contacts', icon: 'applicants.png', class: 'applicants', route: 'contacts',
      sub_routes: [
        {
          title: 'Contact List',  icon: 'contact-list.png', class: 'contact-list', route: 'contacts/list'
        },
        {
          title: 'Candidates', icon: 'applicants.png', class: 'applicants', route: 'contacts/candidates',
        },
      ]
    },

    {
      title: 'Interviews', icon: 'create-interview.png', class: 'interviews', route: 'interview'
    },

    {
      title: 'My Subscription', icon: 'subscribe.png', class: 'subscription',
      route: 'subscription'
    },

    {
      title: 'Employer Branding', icon: 'account.png', class: 'accounts',
      route: 'company/details'
    },
  ];

  @HostListener('window:resize', ['$event'])
    onResize(event: any) {
      this.screenHeight = window.innerHeight;
  }

  ngOnInit(): void {
    this.location = this.router.url;
    this.screenHeight = window.innerHeight;
  }

  ngOnDestroy(): void {
    if(this.req) this.req.unsubscribe();
  }

  changeRoute(route){
    console.log(route);
    this.router.navigate([route]);
  }
}
