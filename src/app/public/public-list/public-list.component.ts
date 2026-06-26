import { Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SeoService } from '@app-core/services/seo.service';

@Component({
  selector: 'app-public-list',
  templateUrl: './public-list.component.html',
  styleUrls: ['./public-list.component.scss']
})
export class PublicListComponent implements OnInit, OnDestroy {
  // MV3-F4: asyncLocalStorage methods called bare localStorage without a
  // typeof guard. When this component is SSR-rendered for /jobs, the async
  // microtask (Promise.resolve()) resolves while the server-side event loop
  // is still processing, which triggers a ReferenceError in the Node.js
  // environment where localStorage is not defined. The typeof guard avoids
  // the throw entirely and returns a safe fallback (null / no-op).
  asyncLocalStorage = {
    setItem: async function (key, value) {
      await Promise.resolve();
      if (typeof localStorage !== 'undefined') { localStorage.setItem(key, value); }
    },
    getItem: async function (key) {
      await Promise.resolve();
      return (typeof localStorage !== 'undefined') ? localStorage.getItem(key) : null;
    }
  };

  userRole: string;
  screenSize: number = 1600;

  constructor(
    private seoService: SeoService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) { }

  ngOnInit(): void {
    // OPTIMIZE-V5: guard window.innerWidth with isPlatformBrowser so SSR
    // does not throw ReferenceError when /jobs is server-rendered.
    if (isPlatformBrowser(this.platformId)) {
      this.screenSize = window.innerWidth;
    }
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
  onResize(_event: any) {
    // OPTIMIZE-R4: guard with isPlatformBrowser — HostListeners can fire
    // during SSR hydration on some Angular Universal versions and would throw
    // a ReferenceError because `window` is not defined on the server.
    if (isPlatformBrowser(this.platformId)) {
      this.screenSize = window.innerWidth;
    }
  }
}
