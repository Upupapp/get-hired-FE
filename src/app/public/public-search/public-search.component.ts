import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { AdminService } from '@app-shared/services/auth/admin/admin.service';
import { Subscription } from 'rxjs';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import { SeoService } from '@app-core/services/seo.service';

@Component({
  selector: 'app-public-search',
  animations: [mainAnimations],
  templateUrl: './public-search.component.html',
  styleUrls: ['./public-search.component.scss']
})
export class PublicSearchComponent implements OnInit {
  public screenSize: number = 1600;
  // OPTIMIZE-V5: field initializers that call localStorage/sessionStorage
  // crash on the SSR server. Moved to ngOnInit behind isPlatformBrowser guard.
  public loggedUserData: any = null;
  public loggedUser: any;
  private req?: Subscription;
  public userRole: string;

  public jobSearch: any = null;
  public keyword: string = '';
  public work_setup: string = 'Work Setup';
  public job_type: string = 'Job Type';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) { }

  // OPTIMIZE-R3: asyncLocalStorage wraps bare localStorage calls; these crash
  // on the SSR server. The object is retained for backward-compat with
  // getUserRole(), but both methods are now no-ops on the server.
  asyncLocalStorage = {
    setItem: async function (key, value) {
      await Promise.resolve();
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    },
    getItem: async function (key) {
      await Promise.resolve();
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
  };

  ngOnInit(): void {
    // OPTIMIZE-V5: guard all browser-only APIs with isPlatformBrowser so SSR
    // does not throw when /jobs/search/:keyword is server-rendered.
    if (isPlatformBrowser(this.platformId)) {
      this.screenSize = window.innerWidth;
      this.loggedUserData = JSON.parse(localStorage.getItem('userData') || 'null');
      this.jobSearch = JSON.parse(sessionStorage.getItem('job-search') || 'null');
    }

    // GH-ACT-021 fix: pre-fill the search/filter inputs from the active
    // search instead of always rendering blank -- previously these fields
    // never reflected `jobSearch`, so re-opening this page (or re-searching
    // from it) silently lost the user's current keyword/work setup/job type.
    this.keyword = this.jobSearch?.keyword ?? '';
    this.work_setup = this.jobSearch?.work_setup ?? 'Work Setup';
    this.job_type = this.jobSearch?.job_type ?? 'Job Type';
    this.getUserRole();

    // SEO Phase 8: search results — canonical points to /jobs (no query params).
    // Use noindex on paginated/filtered search results to avoid duplicate content.
    const kw = this.keyword;
    this.seoService.setPageMeta({
      title: kw
        ? `"${kw}" Jobs in the Philippines | GetHired Online`
        : 'Job Search Results | GetHired Online',
      description: kw
        ? `Find "${kw}" jobs in the Philippines on GetHired Online. Browse matching roles, filter by work setup and job type, and apply online.`
        : 'Search and filter thousands of job opportunities in the Philippines on GetHired Online. Browse by role, work setup, and job type.',
      canonical: 'https://gethiredonline.app/jobs',
      robots: 'noindex, follow',
    });
  }

  async getUserRole() {
    this.userRole = await this.asyncLocalStorage.getItem('role') || null;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }

  findJobs() {
    // GH-ACT-021 fix: the previous implementation relied on a fragile
    // navigate-away-then-back round trip (`/jobs` then `jobs/search/:kw`)
    // purely to force this component to re-construct and re-read
    // sessionStorage in its field initializer -- and even then, the
    // work_setup/job_type values were captured but never actually used by
    // JobPostsListComponent's filter (see job-posts-list.component.ts fix).
    // Updating `jobSearch` directly lets the existing
    // [searchData]="jobSearch" binding take effect immediately, with no
    // navigation trick required.
    const jobSearchData = {
      keyword: this.keyword || '',
      work_setup: this.work_setup,
      job_type: this.job_type,
    };

    this.jobSearch = jobSearchData;
    sessionStorage.setItem('job-search', JSON.stringify(jobSearchData));

    // Keep the URL shareable/bookmarkable without forcing a re-navigation
    // round trip.
    this.router.navigate([`/jobs/search/${this.keyword || ''}`]);
  }
}
