import { Component, OnInit } from '@angular/core';
import { CompaniesService } from './companies.service';
import { SeoService } from '@app-core/services/seo.service';
import { CompanyListItem } from './companies.model';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit {

  companies: CompanyListItem[] = [];
  loading = true;
  error = false;
  skeletonItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  constructor(
    private companiesService: CompaniesService,
    private seoService: SeoService,
  ) {}

  ngOnInit(): void {
    this.seoService.setPageMeta({
      title: 'Browse Companies | GetHired',
      description: 'Discover companies hiring on GetHired Online — explore company profiles, open jobs, and hiring processes.',
      canonical: 'https://gethiredonline.app/companies',
      robots: 'index, follow',
    });

    this.companiesService.getPublicCompanies().subscribe({
      next: (res: any) => {
        const data = res && res.data ? res.data : null;
        this.companies = (data && data.companies) ? data.companies : [];
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  getInitial(name: string): string {
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : '?';
  }

  jobsLabel(count: number): string {
    if (count === 0) { return 'No open jobs'; }
    return count + (count === 1 ? ' open job' : ' open jobs');
  }
}
