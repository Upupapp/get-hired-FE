import {
  Component,
  ElementRef,
  Inject,
  Input,
  ViewChild,
  OnChanges,
  OnInit,
  OnDestroy,
  HostListener,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { jobLists, Job } from '../../utils/job-list-model-interface';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import { AdminService } from '@app-shared/services/auth/admin/admin.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-job-posts',
  animations: [mainAnimations],
  templateUrl: './job-posts.component.html',
  styleUrls: ['./job-posts.component.scss']
})
export class JobPostsComponent implements OnInit, OnDestroy {

  private req: Subscription;
  public loading: boolean = true;
  public screenSize: number = 1600;

  public jobLists: Job[] = []//jobLists;
  public listView: boolean = false;

  public loggedUser: any;
  // OPTIMIZE-R3: localStorage field initializer crashes on SSR server.
  // Moved to ngOnInit behind isPlatformBrowser guard.
  public loggedUserData: any = null;
  public location: any;


  constructor(private router:Router,
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService,
    @Inject(PLATFORM_ID) private platformId: object) {

    // OPTIMIZE-R3: nested subscription leak fixed. Each router event was
    // opening a new inner adminStatus$ subscription. Replace with a single
    // direct subscribe; also removes the redundant per-event localStorage read.
    this.req = this.adminService.adminStatus$.subscribe((result: any) => {
      this.loggedUser = result;
    });
    this.location = this.router.url;
  }

  ngOnInit(): void {
    // OPTIMIZE-R3: guard browser-only APIs with isPlatformBrowser.
    if (isPlatformBrowser(this.platformId)) {
      this.screenSize = window.innerWidth;
      this.loggedUserData = JSON.parse(localStorage.getItem('userData') || 'null');
    }
  }

  ngOnDestroy(): void {
    if(this.req) this.req.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }

}
