import { Component, HostListener, OnInit } from '@angular/core';
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
  public loggedUserData: any = JSON.parse(localStorage.getItem('userData'));
  public loggedUser: any;
  private req?: Subscription;
  public userRole: string;

  public jobSearch = JSON.parse(sessionStorage.getItem('job-search'));
  public keyword: string;  
  public work_setup: string = 'Work Setup';  
  public job_type: string = 'Job Type';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
  ) { }

  asyncLocalStorage = {
    setItem: async function (key, value) {
      await Promise.resolve();
      localStorage.setItem(key, value);
    },
    getItem: async function (key) {
      await Promise.resolve();
      return localStorage.getItem(key);
    }
  };

  ngOnInit(): void {
    this.screenSize = window.innerWidth;
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
        ? `Search results for "${kw}" jobs in the Philippines on GetHired Online.`
        : 'Search and browse job opportunities in the Philippines on GetHired Online.',
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
