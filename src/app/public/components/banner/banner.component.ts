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
  selector: 'app-public-banner',
  animations: [mainAnimations],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit, OnDestroy {
  @Input() screenSize: number = 1600;
  // OPTIMIZE-V5: localStorage in a field initializer crashes on SSR.
  // Moved to ngOnInit behind isPlatformBrowser guard.
  public loggedUserData: any = null;
  public loggedUser: any;
  private req?: Subscription;

  public keyword: string;
  public work_setup: string = 'Work Setup';
  public job_type: string = 'Job Type';

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService,
    @Inject(PLATFORM_ID) private platformId: object) {
    // OPTIMIZE-V5: fix nested subscription leak. Previously, each router event
    // opened a new inner subscription to adminStatus$ without ever closing it,
    // leaking O(n) subscriptions proportional to navigation events during the
    // component lifetime. Replace with a single direct subscribe — adminStatus$
    // is a BehaviorSubject/ReplaySubject so the latest value is emitted on
    // subscribe without needing router event triggering.
    this.req = this.adminService.adminStatus$.subscribe((result: any) => {
      this.loggedUser = result;
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loggedUserData = JSON.parse(localStorage.getItem('userData') || 'null');
    }
  }

  ngOnDestroy(): void {
    if (this.req) this.req.unsubscribe();
  }

  findJobs(){
    let init_route = `/job-post/${this.keyword}`;
    let work_setup = this.work_setup !== 'Work Setup' ? init_route.concat(`/${this.work_setup?.toLowerCase()}`) : init_route;
    let job_type = this.job_type !== 'Job Type' ? work_setup.concat(`/${this.job_type?.toLowerCase()}`) : work_setup;

    /*if(this.keyword){
      console.log(job_type)
      this.router.navigate([job_type]);
    }

    else if(!this.keyword && (this.work_setup !== 'Work Setup' || this.job_type !== 'Job Type')) {
      init_route = `/job-post`;
      work_setup = this.work_setup !== 'Work Setup' ? init_route.concat(`/${this.work_setup?.toLowerCase()}`) : init_route;
      job_type = this.job_type !== 'Job Type' ? work_setup.concat(`/${this.job_type?.toLowerCase()}`) : work_setup;

      this.router.navigate([job_type]);
    }*/

    let job_search_data = {
      keyword: this.keyword,  
      work_setup: this.work_setup,  
      job_type: this.job_type
    };

    this.router.navigate([`jobs/search/${this.keyword}`])

    sessionStorage.setItem('job-search', JSON.stringify(job_search_data));

    console.log(job_search_data)

  }
}
