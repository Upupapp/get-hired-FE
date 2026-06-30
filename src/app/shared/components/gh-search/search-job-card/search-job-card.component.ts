import { Component, Input, ChangeDetectionStrategy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SearchJobResult } from '@app-core/services/search.service';

@Component({
  selector: 'app-search-job-card',
  templateUrl: './search-job-card.component.html',
  styleUrls: ['./search-job-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchJobCardComponent {
  @Input() job!: SearchJobResult;
  @Input() showCompanyLink = true;
  logoError = false;
  isLoggedIn = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = !!localStorage.getItem('role');
    }
  }

  viewJob() {
    this.router.navigate(['/jobs/details', this.job.jobId]);
  }

  viewCompany(event: MouseEvent) {
    event.stopPropagation();
    if (this.job.companySlug) {
      this.router.navigate(['/companies', this.job.companySlug]);
    }
  }

  formatSalary(): string | null {
    if (!this.job.salary) return null;
    const curr = this.job.salary.currency || 'PHP';
    const fmt = (n: number | null) => n != null ? '₱' + n.toLocaleString() : null;
    const min = fmt(this.job.salary.min);
    const max = fmt(this.job.salary.max);
    if (min && max) return `${min} – ${max}`;
    if (max) return `Up to ${max}`;
    if (min) return `From ${min}`;
    return null;
  }

  getRelativeTime(): string {
    const date = this.job.updatedAt || this.job.postedAt;
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  }

  onLogoError() {
    this.logoError = true;
  }

  createProfile(event: MouseEvent) {
    event.stopPropagation();
    this.router.navigate(['/register']);
  }

  logIn(event: MouseEvent) {
    event.stopPropagation();
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/jobs/details/' + this.job.jobId } });
  }
}
