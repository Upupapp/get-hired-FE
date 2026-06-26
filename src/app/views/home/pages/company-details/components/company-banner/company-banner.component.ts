import { Component, OnInit, Input, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-company-banner',
  animations: [mainAnimations],
  templateUrl: './company-banner.component.html',
  styleUrls: ['./company-banner.component.scss']
})
export class CompanyBannerComponent implements OnInit {
  @Input() companyData: any;

  public firstSentence: string;
  public bannerImage: any = undefined;
  public bannerEdit: boolean = false;
  public bannerHeight: number;

  // MOBILEVIEW_RECENT_4: inject PLATFORM_ID for SSR guard on document access
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    this.firstSentence = this.companyData?.description;
    // MOBILEVIEW_RECENT_4: document.getElementById crashes on SSR server.
    // Guard with isPlatformBrowser — bannerHeight remains undefined on server,
    // which is safe since it only affects desktop visual layout.
    if (isPlatformBrowser(this.platformId)) {
      const banner_sub_id = document.getElementById('bg-details');
      const bannerHeight = (banner_sub_id?.offsetHeight ?? 0) + 65;
      this.bannerHeight = bannerHeight;
    }
  }

}
