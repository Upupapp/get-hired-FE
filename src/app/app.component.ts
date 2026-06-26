import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title = 'Get Hired';

  constructor(
    public translateService: TranslateService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit(): void {
    const browserLang: any = this.translateService.getBrowserLang();
    const selectedLang: any = localStorage.getItem("selectedLang");
    this.translateService.use(selectedLang ? selectedLang : browserLang.match(/en|vie/) ? browserLang : 'en');

    if (isPlatformBrowser(this.platformId)) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
      ).subscribe((event: any) => {
        try {
          const gtag = (window as any).gtag;
          if (typeof gtag === 'function') {
            gtag('event', 'page_view', {
              page_path: event.urlAfterRedirects,
              page_location: window.location.href,
            });
          }
        } catch (_) { /* blocked or unsupported */ }
      });
    }
  }
}
