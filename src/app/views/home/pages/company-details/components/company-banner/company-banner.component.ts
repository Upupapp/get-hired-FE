import { Component, OnInit, Input } from '@angular/core';
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

  constructor() { }

  ngOnInit(): void {
    this.firstSentence = this.companyData?.description  
    let banner_sub_id = document.getElementById('bg-details'); 
    let bannerHeight = banner_sub_id?.offsetHeight + 65;
    this.bannerHeight = bannerHeight;
  }

}
