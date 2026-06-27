// GETHIRED_PUBLIC_COMPANY_PROFILE_REDESIGN_TRUST_JOBS_SEO_FULLSTACK_V3
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { Subscription, of } from 'rxjs';
import { switchMap, catchError, take } from 'rxjs/operators';

import { CompaniesService } from '../companies.service';
import { SeoService } from '@app-core/services/seo.service';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { PublicCompanyProfile, PublicJob } from '../companies.model';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-public-company-details',
  templateUrl: './public-company-details.component.html',
  styleUrls: ['./public-company-details.component.scss'],
  animations: [mainAnimations]
})
export class PublicCompanyDetailsComponent implements OnInit, OnDestroy {

  profile: PublicCompanyProfile | null = null;
  jobs: PublicJob[] = [];
  loading = true;
  jobsLoading = true;
  notFound = false;
  copied = false;

  private subs = new Subscription();
  private copyTimer: any = null;

  constructor(
    private companiesService: CompaniesService,
    private route: ActivatedRoute,
    private router: Router,
    private clipboard: Clipboard,
    private seoService: SeoService,
    private snackbar: SnackbarService,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.params['slug'];
    const legacyId = this.route.snapshot.queryParams['id'];

    if (slug) {
      this.loadBySlug(slug);
    } else if (legacyId) {
      this.resolveLegacyId(legacyId);
    } else {
      this.notFound = true;
      this.loading = false;
    }
  }

  private loadBySlug(slug: string): void {
    this.loading = true;
    this.jobsLoading = true;

    const profileSub = this.companiesService.getPublicCompanyProfile(slug)
      .pipe(
        switchMap((res: any) => {
          const data = res && res.data ? res.data : null;
          this.profile = data;
          this.loading = false;

          if (data && data.seo) {
            this.updateSeo(data);
          }

          this.jobsLoading = true;
          return this.companiesService.getPublicCompanyJobs(slug).pipe(
            catchError(function() { return of(null); })
          );
        }),
        catchError((err) => {
          const status = err && err.status ? err.status : 0;
          if (status === 404) {
            this.notFound = true;
          }
          this.loading = false;
          this.jobsLoading = false;
          this.setNotFoundSeo();
          return of(null);
        })
      )
      .subscribe((jobsRes: any) => {
        if (jobsRes && jobsRes.data) {
          this.jobs = jobsRes.data.jobs || [];
        }
        this.jobsLoading = false;
      });

    this.subs.add(profileSub);
  }

  private resolveLegacyId(companyId: string): void {
    this.loading = true;
    const resolveSub = this.companiesService.resolveCompanyIdToSlug(companyId)
      .pipe(
        catchError(function() { return of(null); })
      )
      .subscribe((res: any) => {
        const slug = res && res.data && res.data.slug ? res.data.slug : null;
        if (slug) {
          this.router.navigate(['/companies', slug], { replaceUrl: true });
        } else {
          // No slug — show not found; legacy ID-only profiles not publicly routable
          this.notFound = true;
          this.loading = false;
          this.setNotFoundSeo();
        }
      });
    this.subs.add(resolveSub);
  }

  private updateSeo(profile: PublicCompanyProfile): void {
    const seo = profile.seo || {};
    this.seoService.setPageMeta({
      title: seo.title || (profile.displayName + ' | GetHired'),
      description: seo.description || '',
      canonical: seo.canonical || ('https://gethiredonline.app/companies/' + profile.slug),
      robots: 'index, follow',
      ogImage: seo.ogImage || null,
    });
    this.seoService.setBreadcrumbJsonLd([
      { name: 'Home', url: 'https://gethiredonline.app/home' },
      { name: 'Companies', url: 'https://gethiredonline.app/companies' },
      { name: profile.displayName, url: 'https://gethiredonline.app/companies/' + profile.slug },
    ]);
  }

  private setNotFoundSeo(): void {
    this.seoService.setPageMeta({
      title: 'Company Not Found | GetHired',
      description: 'This company profile may be unavailable or not published yet.',
      canonical: 'https://gethiredonline.app/companies',
      robots: 'noindex, nofollow',
    });
  }

  copyLink(): void {
    const url = this.profile
      ? 'https://gethiredonline.app/companies/' + this.profile.slug
      : window.location.href;
    this.clipboard.copy(url);
    this.copied = true;

    if ('vibrate' in navigator) {
      try { navigator.vibrate(10); } catch(e) {}
    }

    if (this.copyTimer) { clearTimeout(this.copyTimer); }
    this.copyTimer = setTimeout(() => { this.copied = false; }, 2500);
  }

  scrollToJobs(): void {
    const el = document.getElementById('open-jobs');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  viewJob(job: PublicJob): void {
    this.router.navigateByUrl('/jobs/details/' + job.jobId);
  }

  formatSalary(job: PublicJob): string {
    if (!job.salaryMin) { return ''; }
    const cur = job.currency || 'PHP';
    const rate = job.rate || 'month';
    const min = Math.round(job.salaryMin).toLocaleString();
    const max = job.salaryMax ? Math.round(job.salaryMax).toLocaleString() : null;
    return cur + ' ' + min + (max ? ' – ' + max : '') + ' / ' + rate;
  }

  getPostedLabel(postedAt: string | null): string {
    if (!postedAt) { return ''; }
    const diff = Date.now() - new Date(postedAt).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) { return 'Today'; }
    if (days === 1) { return 'Yesterday'; }
    if (days < 7) { return days + 'd ago'; }
    if (days < 30) { return Math.floor(days / 7) + 'w ago'; }
    if (days < 365) { return Math.floor(days / 30) + 'mo ago'; }
    return Math.floor(days / 365) + 'y ago';
  }

  get initials(): string {
    if (!this.profile || !this.profile.displayName) { return '?'; }
    return this.profile.displayName.charAt(0).toUpperCase();
  }

  ngOnDestroy(): void {
    this.seoService.clearBreadcrumbJsonLd();
    this.subs.unsubscribe();
    if (this.copyTimer) { clearTimeout(this.copyTimer); }
  }
}
