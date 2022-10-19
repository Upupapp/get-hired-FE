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
  selector: 'app-applicants-panel-sidebar',
  animations: [mainAnimations],
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
      title: 'Jobs Opening', icon: 'jobs.png', class: 'jobs', route: 'jobs'
    },

    {
      title: 'Inbox', icon: 'applicants.png', class: 'inbox', route: 'inbox'
    },

    {
      title: 'Profile', icon: 'account.png', class: 'profile', route: 'profile'
    },

    {
      title: 'Settings', icon: 'expired-jobs.png', class: 'expired', route: 'settings'
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
