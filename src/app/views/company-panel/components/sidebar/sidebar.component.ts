import { Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnDestroy 
} from '@angular/core';
import { 
  Router, 
  ActivatedRoute 
} from '@angular/router';
import { AdminService } from '@app-shared/services/auth/admin/admin.service';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs';
import * as Model from '@main/app.model';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-company-panel-sidebar',
  animations: [mainAnimations],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private req: Subscription;

  @Input() sidebarWidth;

  public location: any = '';
  public loggedUserData: any = JSON.parse(localStorage.getItem('userData'));
  
  constructor(private router: Router,
    private route: ActivatedRoute) { 
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
      title: 'Contacts', icon: 'create-interview.png', class: 'interviews', route: 'contact-list',
      sub_routes: [
        {
          title: 'Contact List',  icon: 'contact-list.png', class: 'contact-list', route: 'contact-list'
        },  

        {
          title: 'Contact Group',  icon: 'contact-list.png', class: 'contact-list', route: 'contact-group'
        },  

        {
          title: 'Candidates', icon: 'applicants.png', class: 'applicants', route: 'contact-list/candidates', 
        }, 

        
      ]
    },

    {
      title: 'Interviews', icon: 'applicants.png', class: 'applicants', route: 'create-interview'
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
