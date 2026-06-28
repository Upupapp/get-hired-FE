import { Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { SeoService } from '@app-core/services/seo.service';
import {
  SearchService, FederatedSearchResponse, SearchJobResult, SearchCompanyResult,
  CompanySpotlight, SearchCounts, EmptyRecovery,
} from '@app-core/services/search.service';

export type SearchTab = 'all' | 'jobs' | 'companies';

@Component({
  selector: 'app-public-list',
  templateUrl: './public-list.component.html',
  styleUrls: ['./public-list.component.scss'],
})
export class PublicListComponent implements OnInit, OnDestroy {
  asyncLocalStorage = {
    setItem: async function (key: string, value: string) {
      await Promise.resolve();
      if (typeof localStorage !== 'undefined') { localStorage.setItem(key, value); }
    },
    getItem: async function (key: string) {
      await Promise.resolve();
      return (typeof localStorage !== 'undefined') ? localStorage.getItem(key) : null;
    }
  };

  userRole = '';
  screenSize = 1600;

  // Search state
  isSearchMode = false;
  searchLoading = false;
  searchError = false;
  activeQuery = '';
  activeTab: SearchTab = 'all';
  activeFilters: { workSetup?: string; employmentType?: string; location?: string; sort?: string } = {};
  searchPage = 1;

  // Federated results
  jobResults: SearchJobResult[] = [];
  companyResults: SearchCompanyResult[] = [];
  counts: SearchCounts = { all: 0, jobs: 0, companies: 0 };
  jobsTotal = 0;
  companiesTotal = 0;
  jobsHasMore = false;
  companiesHasMore = false;
  companySpotlight: CompanySpotlight | null = null;
  emptyRecovery: EmptyRecovery | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private seoService: SeoService,
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.screenSize = window.innerWidth;
    }
    this.getUserRole();

    this.route.queryParams.pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      switchMap(params => {
        const q = (params['q'] || '').trim();
        const location = (params['location'] || '').trim();
        const workSetup = params['workSetup'] || null;
        const employmentType = params['employmentType'] || null;
        const sort = params['sort'] || 'relevance';
        const page = parseInt(params['page'], 10) || 1;
        const tab = (params['type'] || 'all') as SearchTab;

        this.activeQuery = q;
        this.activeFilters = { workSetup, employmentType, location, sort };
        this.searchPage = page;
        this.activeTab = ['all', 'jobs', 'companies'].indexOf(tab) !== -1 ? tab : 'all';
        this.isSearchMode = !!(q || workSetup || employmentType || location);

        this.updateSeo(q);

        if (this.isSearchMode) {
          this.searchLoading = true;
          this.searchError = false;
          this.clearResults();
          return this.searchService.searchPublic({
            q, location, workSetup: workSetup || undefined, employmentType: employmentType || undefined,
            sort: sort || undefined, type: this.activeTab, page,
          });
        }

        this.seoService.setPageMeta({
          title: 'Browse Jobs in the Philippines | GetHired Online',
          description: 'Search thousands of job opportunities in the Philippines. Apply online and track your applications with GetHired Online.',
          canonical: 'https://gethiredonline.app/jobs',
          robots: 'index, follow',
        });
        this.seoService.setBreadcrumbJsonLd([
          { name: 'Home', url: 'https://gethiredonline.app/home' },
          { name: 'Jobs', url: 'https://gethiredonline.app/jobs' },
        ]);
        return [];
      }),
      takeUntil(this.destroy$),
    ).subscribe({
      next: (res: any) => {
        if (res && res.counts !== undefined) {
          // New federated response
          const fed = res as FederatedSearchResponse;
          this.counts = fed.counts || { all: 0, jobs: 0, companies: 0 };
          this.jobResults = (fed.groups && fed.groups.jobs) ? fed.groups.jobs.items : [];
          this.companyResults = (fed.groups && fed.groups.companies) ? fed.groups.companies.items : [];
          this.jobsTotal = (fed.groups && fed.groups.jobs) ? fed.groups.jobs.total : 0;
          this.companiesTotal = (fed.groups && fed.groups.companies) ? fed.groups.companies.total : 0;
          this.jobsHasMore = !!(fed.groups && fed.groups.jobs && fed.groups.jobs.hasMore);
          this.companiesHasMore = !!(fed.groups && fed.groups.companies && fed.groups.companies.hasMore);
          this.companySpotlight = fed.companySpotlight || null;
          this.emptyRecovery = fed.emptyRecovery || null;
        }
        this.searchLoading = false;
      },
      error: () => {
        this.searchLoading = false;
        this.searchError = true;
      },
    });
  }

  private clearResults() {
    this.jobResults = [];
    this.companyResults = [];
    this.counts = { all: 0, jobs: 0, companies: 0 };
    this.companySpotlight = null;
    this.emptyRecovery = null;
  }

  private updateSeo(q: string) {
    const title = q
      ? `"${q}" Jobs & Companies in the Philippines | GetHired Online`
      : 'Job Search Results | GetHired Online';
    this.seoService.setPageMeta({
      title,
      description: q
        ? `Find "${q}" jobs and companies in the Philippines on GetHired Online. Filter by location, work setup, and job type.`
        : 'Search job opportunities in the Philippines on GetHired Online.',
      canonical: 'https://gethiredonline.app/jobs',
      robots: 'noindex, follow',
    });
  }

  switchTab(tab: SearchTab) {
    const qp = this.buildCurrentParams();
    if (tab !== 'all') {
      qp['type'] = tab;
    } else {
      delete qp['type'];
    }
    qp['page'] = '1';
    this.router.navigate(['/jobs'], { queryParams: qp });
    this.vibrate(5);
  }

  onSearchSubmit(q: string) {
    const qp: any = {};
    if (q) qp['q'] = q;
    qp['page'] = '1';
    this.router.navigate(['/jobs'], { queryParams: qp });
  }

  applyFilter(key: string, value: string | null) {
    const qp = this.buildCurrentParams();
    if (value) { qp[key] = value; } else { delete qp[key]; }
    qp['page'] = '1';
    this.router.navigate(['/jobs'], { queryParams: qp });
  }

  clearAllFilters() {
    const qp: any = {};
    if (this.activeQuery) qp['q'] = this.activeQuery;
    if (this.activeTab !== 'all') qp['type'] = this.activeTab;
    this.router.navigate(['/jobs'], { queryParams: qp });
  }

  browseAll() {
    this.router.navigate(['/jobs']);
  }

  changePage(p: number) {
    const qp = this.buildCurrentParams();
    qp['page'] = String(p);
    this.router.navigate(['/jobs'], { queryParams: qp });
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private buildCurrentParams(): any {
    const qp: any = {};
    if (this.activeQuery) qp['q'] = this.activeQuery;
    if (this.activeFilters.workSetup) qp['workSetup'] = this.activeFilters.workSetup;
    if (this.activeFilters.employmentType) qp['employmentType'] = this.activeFilters.employmentType;
    if (this.activeFilters.location) qp['location'] = this.activeFilters.location;
    if (this.activeFilters.sort && this.activeFilters.sort !== 'relevance') qp['sort'] = this.activeFilters.sort;
    if (this.activeTab !== 'all') qp['type'] = this.activeTab;
    return qp;
  }

  get hasActiveFilters(): boolean {
    return !!(this.activeFilters.workSetup || this.activeFilters.employmentType || this.activeFilters.location);
  }

  get activeFilterChips(): { label: string; key: string }[] {
    const chips: { label: string; key: string }[] = [];
    if (this.activeFilters.workSetup) chips.push({ label: this.activeFilters.workSetup, key: 'workSetup' });
    if (this.activeFilters.employmentType) chips.push({ label: this.activeFilters.employmentType, key: 'employmentType' });
    if (this.activeFilters.location) chips.push({ label: this.activeFilters.location, key: 'location' });
    return chips;
  }

  removeChip(chip: { key: string }) {
    this.applyFilter(chip.key, null);
  }

  // ── Browse-mode split preview ──────────────────────────────────────────────
  previewJob: any = null;

  onJobSelected(job: any): void {
    if (!job) return;
    // On mobile/tablet (≤991px) the preview panel is hidden — navigate directly
    if (this.screenSize <= 991) {
      this.navigateToDetail(job.jobId);
      return;
    }
    this.previewJob = job;
    this.vibrate(5);
  }

  closePreview(): void {
    this.previewJob = null;
  }

  navigateToDetail(jobId: string): void {
    this.router.navigateByUrl('/jobs/details/' + jobId);
  }

  previewSalary(job: any): string {
    const min = (job && job.salaryMinimum) ? job.salaryMinimum : 0;
    const max = (job && job.salaryMaximum) ? job.salaryMaximum : 0;
    const currency = (job && job.salaryCurrency) ? job.salaryCurrency : '₱';
    if (!min && !max) return 'Salary not disclosed';
    const fmt = function(n: number) { return Number(n).toLocaleString(); };
    if (min && max) return currency + ' ' + fmt(min) + ' – ' + fmt(max);
    if (min) return 'From ' + currency + ' ' + fmt(min);
    return 'Up to ' + currency + ' ' + fmt(max);
  }

  previewLocation(job: any): string {
    const city = (job && job.jobCity) ? job.jobCity : '';
    const country = (job && job.jobCountry) ? job.jobCountry : '';
    if (city && country) return city + ', ' + country;
    return city || country || 'Location not specified';
  }

  // Visible jobs/companies based on active tab
  get visibleJobs(): SearchJobResult[] {
    return this.activeTab === 'companies' ? [] : this.jobResults;
  }

  get visibleCompanies(): SearchCompanyResult[] {
    return this.activeTab === 'jobs' ? [] : this.companyResults;
  }

  get hasJobsNextPage(): boolean {
    return this.activeTab !== 'companies' && this.jobsHasMore;
  }

  get hasCompaniesNextPage(): boolean {
    return this.activeTab !== 'jobs' && this.companiesHasMore;
  }

  get countSummary(): string {
    const tab = this.activeTab;
    if (tab === 'jobs') return this.counts.jobs + ' job' + (this.counts.jobs === 1 ? '' : 's');
    if (tab === 'companies') return this.counts.companies + ' compan' + (this.counts.companies === 1 ? 'y' : 'ies');
    return this.counts.all + ' result' + (this.counts.all === 1 ? '' : 's');
  }

  get emptyRecoveryMessage(): string {
    if (!this.emptyRecovery) return '';
    return this.emptyRecovery.message;
  }

  get isAllEmpty(): boolean {
    return !this.searchLoading && !this.searchError && this.counts.all === 0;
  }

  get showSpotlight(): boolean {
    return !!(this.activeTab === 'all' && this.companySpotlight);
  }

  async getUserRole() {
    this.userRole = await this.asyncLocalStorage.getItem('role') || '';
  }

  trackByJobId(_: number, job: SearchJobResult) { return job.jobId; }
  trackByCompanyId(_: number, company: SearchCompanyResult) { return company.companyId; }

  vibrate(ms: number) {
    if (isPlatformBrowser(this.platformId) && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.seoService.clearBreadcrumbJsonLd();
  }

  @HostListener('window:resize', ['$event'])
  onResize(_event: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.screenSize = window.innerWidth;
    }
  }
}
