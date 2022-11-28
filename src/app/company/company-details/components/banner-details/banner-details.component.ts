import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from '@main/company/company.model';

@Component({
  selector: 'app-banner-details',
  templateUrl: './banner-details.component.html',
  styleUrls: ['./banner-details.component.scss'],
  animations: [mainAnimations]
})
export class BannerDetailsComponent implements OnInit {
  @Input() details: Model.Company;
  userRole = localStorage.getItem('role');

  public bannerImage: any = undefined;
  public bannerEdit: boolean = false;
  public bannerHeight: number = 400;

  seeMore = 2;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

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

  redirectToEdit(type: string) {
    if(type === 'banner')
      this.clickInputBanner();
    
    else if(type === 'edit') 
      this.router.navigate(['../settings'], { relativeTo: this.route });
  }

  showMore(event: any) {
    this.seeMore = event;
   }

}
