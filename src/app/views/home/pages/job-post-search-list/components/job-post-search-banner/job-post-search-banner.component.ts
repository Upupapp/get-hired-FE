import { Component, Inject, OnInit, OnDestroy, Input, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { AdminService } from '@app-shared/services/auth/admin/admin.service';
import { Subscription } from 'rxjs';
import {
  Router,
  ActivatedRoute
} from '@angular/router';

@Component({
  selector: 'app-job-post-search-banner',
  animations: [mainAnimations],
  templateUrl: './job-post-search-banner.component.html',
  styleUrls: ['./job-post-search-banner.component.scss']
})
export class JobPostSearchBannerComponent implements OnInit, OnDestroy {
  @Input() screenSize: number = 1600;

  // OPTIMIZE-R3: localStorage field initializer crashes on SSR server.
  // Moved to ngOnInit behind isPlatformBrowser guard.
  public loggedUserData: any = null;
  public loggedUser: any;
  private req?: Subscription;

  @Input() keyword: string;
  @Input() work_setup: string = 'Work Setup';
  @Input() job_type: string = 'Job Type';

  constructor(private router:Router,
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService,
    @Inject(PLATFORM_ID) private platformId: object) {
    // OPTIMIZE-R3: nested subscription leak fixed. Each router event opened a
    // new inner adminStatus$ subscription that was never cleaned up.
    // Replace with a single direct subscribe — adminStatus$ emits immediately.
    this.req = this.adminService.adminStatus$.subscribe((result: any) => {
      this.loggedUser = result;
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loggedUserData = JSON.parse(localStorage.getItem('userData') || 'null');
    }
    //console.log(this.keyword, this.work_setup, this.job_type)

    this.keyword = this.keyword != 'undefined' ? this.keyword : '';
    this.work_setup = this.work_setup != 'undefined' ? this.work_setup : '';
    this.job_type = this.job_type != 'undefined' ? this.job_type : '';

    // console.log(this.keyword, this.work_setup, this.job_type)
  }

  ngOnDestroy(): void {
    if(this.req) this.req.unsubscribe();
  }

  findJobs(){
    this.keyword = this.keyword != 'undefined' ? this.keyword : '';
    this.work_setup = this.work_setup != 'undefined' ? this.work_setup : '';
    this.job_type = this.job_type != 'undefined' ? this.job_type : '';

    let init_route = `/job-post/${this.keyword}`;
    let work_setup = this.work_setup !== 'Work Setup' ? init_route.concat(`/${this.work_setup?.toLowerCase()}`) : init_route;
    let job_type = this.job_type !== 'Job Type' ? work_setup.concat(`/${this.job_type?.toLowerCase()}`) : work_setup;

    if(this.keyword){
      this.router.navigate(['/job-post']).then(el => this.router.navigate([job_type]));
    }

    else if(!this.keyword && (this.work_setup || this.job_type)) {
      init_route = `/job-post`;
      work_setup = this.work_setup !== 'Work Setup' ? init_route.concat(`/${this.work_setup?.toLowerCase()}`) : init_route;
      job_type = this.job_type !== 'Job Type' ? work_setup.concat(`/${this.job_type?.toLowerCase()}`) : work_setup;

      this.router.navigate(['/job-post']).then(el => this.router.navigate([job_type]));
    }

  }

}
