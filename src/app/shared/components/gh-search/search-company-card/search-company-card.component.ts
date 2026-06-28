import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SearchCompanyResult } from '@app-core/services/search.service';

@Component({
  selector: 'app-search-company-card',
  templateUrl: './search-company-card.component.html',
  styleUrls: ['./search-company-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchCompanyCardComponent {
  @Input() company!: SearchCompanyResult;

  logoError = false;

  constructor(private router: Router) {}

  onLogoError() { this.logoError = true; }

  viewCompany() {
    if (this.company && this.company.companySlug) {
      this.router.navigate(['/companies', this.company.companySlug]);
    }
  }

  viewJobs() {
    if (this.company) {
      this.router.navigate(['/jobs'], { queryParams: { q: this.company.companyName, type: 'jobs' } });
    }
  }

  get initial(): string {
    return (this.company && this.company.companyName || 'C').charAt(0).toUpperCase();
  }

  get sizeLabel(): string {
    if (!this.company) return '';
    // number_of_employee may be a string like "51-200" or a number
    return '';
  }

  vibrate(ms: number) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  }
}
