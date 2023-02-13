import {
  Component,
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
import { AppFacade } from '@main/state/app.facade';
import { CoreService } from '../services/core.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() user: any;
  @Input() isUserLoggedIn: boolean;
  @Input() isPublic: boolean;
  userRole = localStorage.getItem('role');
  initials: string;

  public req: Subscription;
  public location: any;

  constructor(
    private coreService: CoreService,
    private router: Router,
    private route: ActivatedRoute,
    private appFacade: AppFacade
  ) {
    this.req = this.router.events.subscribe((event: any) => {
      this.location = this.router.url;

      // scroll to top every page change
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.initials = this.user.firstName.charAt(0).toUpperCase() + ' ' + this.user.lastName.charAt(0).toUpperCase();
    }
  }

  navigateToJobs(){
    this.router.navigate(['/jobs'], { relativeTo: this.route })
  }

  redirectToRegister() {
    this.router.navigateByUrl('/signin');
  }

  goToDashboard() {
    switch (this.userRole) {
      case '1':
        this.router.navigateByUrl('/admin/dashboard');
        break;
      case '2':
        this.router.navigateByUrl('/recruiter/dashboard');
        break;
      case '3':
        this.router.navigateByUrl('/user/dashboard');
        break;
    }
  }

  logout() {
    localStorage.clear();
    this.appFacade.resetCredentials();
    this.router.navigateByUrl('/signin');
  }
}
