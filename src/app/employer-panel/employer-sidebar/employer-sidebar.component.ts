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
  @Input() user;
  companyName: string;

  public location: any = '';
  public screenHeight: number = 300;
  sidebarItems: any[];

  constructor(
    private router: Router
  ) {
    this.req = this.router.events.subscribe((event: any) => {
      this.location = this.router.url;
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenHeight = window.innerHeight;
  }

  ngOnInit(): void {
    this.location = this.router.url;
    this.screenHeight = window.innerHeight;
    console.log('Secret')
    console.log(this.user);
  }

  subRouteActive(route){
    if(route.match('jobs') && this.location.match('jobs')
      && !route.match('expired') && this.location !== '/recruiter/jobs/expired'){
      return true;
    }

    else if(this.location === '/recruiter/jobs/expired' && route.match('expired')){
      return true;
    }

    else if(this.location === '/recruiter/' + route && !this.location.match('expired')){
      return true
    }

    else return false;
  }

  ngOnChanges(changes) {
    if (changes.user) {
      console.log('Nagchange');
      if(this.user.companyName && this.user.companyName != "") {
        console.log('Meron na dapat');
        this.sidebarItems = [
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
                title: 'Expired Jobs', icon: 'expired-jobs.png', class: 'expired', route: 'jobs/expired'
              },
            ]
          },
          {
            title: 'Contacts', icon: 'applicants.png', class: 'applicants', route: 'contacts',
            sub_routes: [
              {
                title: 'Contact List', icon: 'contact-list.png', class: 'contact-list', route: 'contacts/list'
              },
              {
                title: 'Contact Group', icon: 'applicants.png', class: 'applicants', route: 'contacts/groups',
              },
              {
                title: 'Candidates', icon: 'applicants.png', class: 'applicants', route: 'contacts/candidates',
              },

            ]
          },
          // {
          //   title: 'Interviews', icon: 'create-interview.png', class: 'interviews', route: 'interview'
          // },
          {
            title: 'My Subscription', icon: 'subscribe.png', class: 'subscription',
            route: 'subscription'
          },
          {
            title: 'Employer Branding', icon: 'account.png', class: 'accounts',
            route: 'company/details'
          }
        ];
      } else {
        console.log('wala padin');
        this.sidebarItems = [
          {
            title: 'Employer Branding', icon: 'account.png', class: 'accounts',
            route: 'company/details'
          }
        ];
      }
    }
  }

  ngOnDestroy(): void {
    if (this.req) this.req.unsubscribe();
  }

  changeRoute(route) {
    console.log(route);
    this.router.navigate([route]);
  }
}
