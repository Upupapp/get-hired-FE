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

  constructor() { }

  ngOnInit(): void {
    this.firstSentence = this.companyData?.description?.split('.')[0];  
  }

}
