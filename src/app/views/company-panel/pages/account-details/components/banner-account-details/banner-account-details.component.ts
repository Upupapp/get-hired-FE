import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-banner-account-details',
  animations: [mainAnimations],
  templateUrl: './banner-account-details.component.html',
  styleUrls: ['./banner-account-details.component.scss']
})
export class BannerAccountDetailsComponent implements OnInit {
  public bannerImage: any = undefined;
  public bannerEdit: boolean = false;
  public bannerHeight: number = 400;

  constructor() { }

  ngOnInit(): void {
    let banner_sub_id = document.getElementById('bg-details'); 
    let bannerHeight = banner_sub_id?.offsetHeight;
    this.bannerHeight = bannerHeight;
    
  }

  onUpload(file: any) {
    this.bannerImage = file;
  }

  clickInputBanner(){
    let doc_id = document.getElementById('btn-uploader');   

    if(doc_id) 
      doc_id.click();

    this.bannerEdit = !this.bannerEdit;

    console.log("SAVEE FUNCTION HERE");  
    
  }

}
