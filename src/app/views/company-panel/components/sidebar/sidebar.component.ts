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

@Component({
  selector: 'app-company-panel-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private req: Subscription;

  @Input() sidebarWidth;

  public location: any = '';

  constructor(private router: Router,
    private route: ActivatedRoute) { 
    this.req = this.router.events.subscribe((event: any) => {
      this.location = this.router.url;
    });
  }

  public sidebarItems: any[] = [
    {
      title: 'Dashboard', icon: 'dashboard.png', class: 'dashboard', route: 'dashboard'
    },

    {
      title: 'Jobs', icon: 'jobs.png', class: 'jobs', route: 'jobs'
    },

    {
      title: 'Applicants', icon: 'applicants.png', class: 'applicants', route: 'applicants'
    },

    {
      title: 'Create an Interview', icon: 'create-interview.png', class: 'interviews', route: 'create-interview'
    },

    {
      title: 'Account Details', icon: 'account.png', class: 'accounts', route: 'account-details'
    },

    {
      title: 'Expired Jobs', icon: 'expired-jobs.png', class: 'expired', route: 'expired-jobs'
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
