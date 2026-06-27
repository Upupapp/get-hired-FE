// GETHIRED_PUBLIC_COMPANY_PROFILE_REDESIGN_TRUST_JOBS_SEO_FULLSTACK_V3
// V3 ADDENDUM: Sticky subnav + Follow Company + enhanced sections
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { Subscription, of } from 'rxjs';
import { switchMap, catchError, take } from 'rxjs/operators';

import { CompaniesService } from '../companies.service';
import { SeoService } from '@app-core/services/seo.service';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { PublicCompanyProfile, PublicJob, PublicCompanyFollowState } from '../companies.model';
import { mainAnimations } from '@app-shared/animations/main-animations';

const SECTION_IDS = ['cph-snapshot', 'cph-why-join', 'cph-jobs', 'cph-hiring-process'];

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

  // ─── Subnav state ──────────────────────────────────────────────────────────
  activeSectionId = 'cph-snapshot';
  hasWhyJoinUs = false;
  hasBenefits = false;

  // ─── Follow state ──────────────────────────────────────────────────────────
  followState: PublicCompanyFollowState = { following: false, available: false, loading: true };
  followLoading = false;

  private currentSlug = '';
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

  // ─── Scroll spy ────────────────────────────────────────────────────────────

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!this.profile || this.loading) { return; }
    const offset = 140;
    let active = SECTION_IDS[0];
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= offset) {
        active = id;
      }
    }
    if (this.activeSectionId !== active) {
      this.activeSectionId = active;
    }
  }

  scrollToSection(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      const offset = 68 + 52;
      const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    this.activeSectionId = id;
  }

  // ─── Data loading ──────────────────────────────────────────────────────────

  private loadBySlug(slug: string): void {
    this.loading = true;
    this.jobsLoading = true;
    this.currentSlug = slug;

    const profileSub = this.companiesService.getPublicCompanyProfile(slug)
      .pipe(
        switchMap((res: any) => {
          const data = res && res.data ? res.data : null;
          this.profile = data;
          this.loading = false;

          if (data) {
            if (data.seo) { this.updateSeo(data); }
            this.hasWhyJoinUs = !!(data.whyJoinUs && data.whyJoinUs.hasContent);
            this.hasBenefits  = !!(data.benefits && data.benefits.hasContent);
            // Load follow state in background (non-blocking)
            this.checkFollowState(slug);
          }

          this.jobsLoading = true;
          return this.companiesService.getPublicCompanyJobs(slug).pipe(
            catchError(function() { return of(null); })
          );
        }),
        catchError((err) => {
          const status = err && err.status ? err.status : 0;
          if (status === 404) { this.notFound = true; }
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
      .pipe(catchError(function() { return of(null); }))
      .subscribe((res: any) => {
        const slug = res && res.data && res.data.slug ? res.data.slug : null;
        if (slug) {
          this.router.navigate(['/companies', slug], { replaceUrl: true });
        } else {
          this.notFound = true;
          this.loading = false;
          this.setNotFoundSeo();
        }
      });
    this.subs.add(resolveSub);
  }

  // ─── Follow Company ────────────────────────────────────────────────────────

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  private checkFollowState(slug: string): void {
    if (!this.isLoggedIn) {
      this.followState = { following: false, available: false, loading: false, message: 'Sign in to follow' };
      return;
    }
    this.followState = { following: false, available: false, loading: true };
    const sub = this.companiesService.getCompanyFollowState(slug)
      .pipe(catchError(function() { return of(null); }))
      .subscribe((res: any) => {
        const data = res && res.data ? res.data : null;
        if (data) {
          this.followState = {
            following: !!(data.following),
            available: !!(data.available),
            loading: false,
            message: data.message || undefined,
          };
        } else {
          this.followState = { following: false, available: false, loading: false };
        }
      });
    this.subs.add(sub);
  }

  follow(): void {
    if (!this.isLoggedIn) { this.promptLogin(); return; }
    if (this.followLoading || !this.currentSlug) { return; }
    this.followLoading = true;
    const sub = this.companiesService.followCompany(this.currentSlug)
      .pipe(catchError(function() { return of(null); }))
      .subscribe((res: any) => {
        this.followLoading = false;
        if (res && res.data) {
          this.followState = { following: true, available: true, loading: false };
          if ('vibrate' in navigator) { try { navigator.vibrate([10, 30, 10]); } catch(e) {} }
        }
      });
    this.subs.add(sub);
  }

  unfollow(): void {
    if (this.followLoading || !this.currentSlug) { return; }
    this.followLoading = true;
    const sub = this.companiesService.unfollowCompany(this.currentSlug)
      .pipe(catchError(function() { return of(null); }))
      .subscribe((res: any) => {
        this.followLoading = false;
        if (res && res.data) {
          this.followState = { following: false, available: true, loading: false };
        }
      });
    this.subs.add(sub);
  }

  promptLogin(): void {
    this.router.navigateByUrl('/login');
  }

  // ─── SEO helpers ──────────────────────────────────────────────────────────

  private updateSeo(profile: PublicCompanyProfile): void {
    const seo = profile.seo;
    this.seoService.setPageMeta({
      title: (seo && seo.title) ? seo.title : (profile.displayName + ' | GetHired'),
      description: (seo && seo.description) ? seo.description : '',
      canonical: (seo && seo.canonical) ? seo.canonical : ('https://gethiredonline.app/companies/' + profile.slug),
      robots: 'index, follow',
      ogImage: (seo && seo.ogImage) ? seo.ogImage : null,
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

  // ─── UI helpers ───────────────────────────────────────────────────────────

  copyLink(): void {
    const url = this.profile
      ? 'https://gethiredonline.app/companies/' + this.profile.slug
      : window.location.href;
    this.clipboard.copy(url);
    this.copied = true;
    if ('vibrate' in navigator) { try { navigator.vibrate(10); } catch(e) {} }
    if (this.copyTimer) { clearTimeout(this.copyTimer); }
    this.copyTimer = setTimeout(() => { this.copied = false; }, 2500);
  }

  scrollToJobs(): void {
    this.scrollToSection('cph-jobs');
  }

  viewJob(job: PublicJob): void {
    this.router.navigateByUrl('/jobs/details/' + job.jobId);
  }

  formatSalary(job: PublicJob): string {
    if (!job.salaryMin) { return ''; }
    const cur  = job.currency || 'PHP';
    const rate = job.rate || 'month';
    const min  = Math.round(job.salaryMin).toLocaleString();
    const max  = job.salaryMax ? Math.round(job.salaryMax).toLocaleString() : null;
    return cur + ' ' + min + (max ? ' – ' + max : '') + ' / ' + rate;
  }

  getPostedLabel(postedAt: string | null): string {
    if (!postedAt) { return ''; }
    const diff = Date.now() - new Date(postedAt).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) { return 'Today'; }
    if (days === 1) { return 'Yesterday'; }
    if (days < 7)  { return days + 'd ago'; }
    if (days < 30) { return Math.floor(days / 7) + 'w ago'; }
    if (days < 365){ return Math.floor(days / 30) + 'mo ago'; }
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
