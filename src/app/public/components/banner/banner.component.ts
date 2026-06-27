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

  findJobs() {
    const keyword = (this.keyword || '').trim();
    const job_search_data = {
      keyword: keyword,
      work_setup: this.work_setup,
      job_type: this.job_type
    };
    sessionStorage.setItem('job-search', JSON.stringify(job_search_data));
    if (keyword) {
      this.router.navigate([`jobs/search/${keyword}`]);
    } else {
      this.router.navigate(['jobs']);
    }
  }
}
