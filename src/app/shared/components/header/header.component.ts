import { Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnDestroy 
} from '@angular/core';
import { 
  Router, 
  ActivatedRoute 
} from '@angular/router';
import { AdminService } from '../../services/auth/admin/admin.service';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs';
import * as Model from '@main/app.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private req?: Subscription;

  public headerItems: any = [
    //{ title: 'Home', id: 'home', route: '/' },
    { title: 'About Us', id: 'about', route: '/about' },
    { title: 'Blog', id: 'about', route: '/about' },
    { title: 'Watch', id: 'about', route: '/about' },
    { 
      title: 'Free Account', 
      id: 'profile', 
      route: '/profile', 
      sub_routes: [
        {
          title: "Account Settings",  
          id: 'account-settings',  
          route: '/profile'
        },
      ]

    },
  ];

  public loggedInCustomer: any;
  public loggedInClient: any;
  public location: any;

  constructor(private router:Router, 
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService) { 

    this.location = this.router.url;

    this.req = this.router.events.subscribe((event: any) => {
      this.location = this.router.url;

      this.adminService.adminStatus$.subscribe((result: any) => {
        this.loggedInClient = result;
      });
    });
  }

  ngOnInit(): void  {
  }

  ngOnDestroy(): void {
    if(this.req) this.req.unsubscribe();
  }

  navigateToRoute(route){
    this.router.navigate([route]);
  }

  adminLogout(): void {
    this.req = this.adminService.logoutAdmin()
    .subscribe(() => {
      window.scrollTo(0, 0);
    });
  }
}
