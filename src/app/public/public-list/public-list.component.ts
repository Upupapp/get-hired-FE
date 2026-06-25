import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { SeoService } from '@app-core/services/seo.service';

@Component({
  selector: 'app-public-list',
  templateUrl: './public-list.component.html',
  styleUrls: ['./public-list.component.scss']
})
export class PublicListComponent implements OnInit, OnDestroy {
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

  userRole: string;
  screenSize: number = 1600;

  constructor(private seoService: SeoService) { }

  ngOnInit(): void {
    this.screenSize = window.innerWidth;
    this.getUserRole();

    // SEO: canonical jobs list page (no query params in canonical)
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
  }

  async getUserRole() {
    this.userRole = await this.asyncLocalStorage.getItem('role') || null;
  }

  ngOnDestroy(): void {
    // Clear list-page breadcrumb when navigating away to avoid stale JSON-LD
    this.seoService.clearBreadcrumbJsonLd();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }
}
