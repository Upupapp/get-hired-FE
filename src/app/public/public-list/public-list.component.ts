import { Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { SeoService } from '@app-core/services/seo.service';
import { SearchService, SearchResponse, SearchJobResult } from '@app-core/services/search.service';

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

  userRole: string = '';
  screenSize = 1600;

  // Search state
  isSearchMode = false;
  searchLoading = false;
  searchError = false;
  activeQuery = '';
  activeFilters: { workSetup?: string; employmentType?: string; location?: string; sort?: string } = {};
  searchResults: SearchJobResult[] = [];
  searchTotal = 0;
  searchPage = 1;
  hasMoreResults = false;

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

    // React to query param changes (supports back/forward navigation)
    this.route.queryParams.pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      switchMap(params => {
        const q = (params['q'] || '').trim();
        const location = (params['location'] || '').trim();
        const workSetup = params['workSetup'] || null;
        const employmentType = params['employmentType'] || null;
        const sort = params['sort'] || 'relevance';
        const page = parseInt(params['page'], 10) || 1;

        this.activeQuery = q;
        this.activeFilters = { workSetup, employmentType, location, sort };
        this.searchPage = page;
        this.isSearchMode = !!(q || workSetup || employmentType || location);

        this.updateSeo(q);

        if (this.isSearchMode) {
          this.searchLoading = true;
          this.searchError = false;
          return this.searchService.searchPublic({
            q, location, workSetup: workSetup || undefined, employmentType: employmentType || undefined,
            sort: (sort as any), scope: 'jobs', page,
          });
        }
        // Browse-all: SEO
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
        if (res && res.results) {
          this.searchResults = res.results as SearchJobResult[];
          this.searchTotal = res.pagination ? res.pagination.total : 0;
          this.hasMoreResults = res.pagination ? res.pagination.hasMore : false;
        }
        this.searchLoading = false;
      },
      error: () => {
        this.searchLoading = false;
        this.searchError = true;
      }
    });
  }

  private updateSeo(q: string) {
    const title = q
      ? `"${q}" Jobs in the Philippines | GetHired Online`
      : 'Job Search Results | GetHired Online';
    this.seoService.setPageMeta({
      title,
      description: q
        ? `Find "${q}" jobs in the Philippines on GetHired Online. Filter by location, work setup, and job type.`
        : 'Search job opportunities in the Philippines on GetHired Online.',
      canonical: 'https://gethiredonline.app/jobs',
      robots: 'noindex, follow',
    });
  }

  onSearchSubmit(q: string) {
    const qp: any = {};
    if (q) qp['q'] = q;
    Object.assign(qp, this.activeFilters);
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
    this.router.navigate(['/jobs'], { queryParams: this.activeQuery ? { q: this.activeQuery } : {} });
  }

  browseAll() {
    this.router.navigate(['/jobs']);
  }

  changePage(p: number) {
    const qp = this.buildCurrentParams();
    qp['page'] = String(p);
    this.router.navigate(['/jobs'], { queryParams: qp });
  }

  private buildCurrentParams(): any {
    const qp: any = {};
    if (this.activeQuery) qp['q'] = this.activeQuery;
    if (this.activeFilters.workSetup) qp['workSetup'] = this.activeFilters.workSetup;
    if (this.activeFilters.employmentType) qp['employmentType'] = this.activeFilters.employmentType;
    if (this.activeFilters.location) qp['location'] = this.activeFilters.location;
    if (this.activeFilters.sort && this.activeFilters.sort !== 'relevance') qp['sort'] = this.activeFilters.sort;
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

  async getUserRole() {
    this.userRole = await this.asyncLocalStorage.getItem('role') || '';
  }

  trackByJobId(_: number, job: SearchJobResult) { return job.jobId; }

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
