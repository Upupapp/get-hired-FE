import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CompanySpotlight } from '@app-core/services/search.service';

@Component({
  selector: 'app-search-spotlight-card',
  templateUrl: './search-spotlight-card.component.html',
  styleUrls: ['./search-spotlight-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchSpotlightCardComponent {
  @Input() spotlight!: CompanySpotlight;
  @Input() query = '';

  logoError = false;

  constructor(private router: Router) {}

  onLogoError() { this.logoError = true; }

  viewCompany() {
    if (this.spotlight && this.spotlight.companySlug) {
      this.router.navigate(['/companies', this.spotlight.companySlug]);
      this.vibrate(5);
    }
  }

  viewJobs() {
    if (this.spotlight) {
      this.router.navigate(['/jobs'], { queryParams: { q: this.spotlight.companyName, type: 'jobs' } });
      this.vibrate(5);
    }
  }

  viewJob(jobId: string) {
    this.router.navigate(['/jobs', jobId]);
    this.vibrate(5);
  }

  get initial(): string {
    return (this.spotlight && this.spotlight.companyName || 'C').charAt(0).toUpperCase();
  }

  vibrate(ms: number) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  }
}
