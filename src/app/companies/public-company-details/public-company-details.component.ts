import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { CompaniesFacade } from '../state/companies.facade';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from "@environments/environment";
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompaniesService } from '../companies.service';
import { catchError, of, Subscription, tap } from 'rxjs';

@Component({
  selector: 'app-public-company-details',
  templateUrl: './public-company-details.component.html',
  styleUrls: ['./public-company-details.component.scss'],
  animations: [mainAnimations]
})
export class PublicCompanyDetailsComponent implements OnInit {

  companyId: string;

  public firstSentence: string;
  public bannerImage: any = undefined;
  public bannerEdit: boolean = false;
  public bannerHeight: number = 0;

  details$ = this.companiesFacade.companyDetails$;
  link$: Subscription;

  constructor(
    private companiesFacade: CompaniesFacade,
    private router: Router,
    private route: ActivatedRoute,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private companiesService: CompaniesService
  ) {
    this.route.queryParams.subscribe(params => {
      this.companyId = params.id;
    });
  }

  ngOnInit(): void {
    this.companiesFacade.getCompany(this.companyId);

    if(this.companyId){

    }
  }

  getDetails(){
    this.details$.subscribe((result) => {
      if(result){
        let banner_sub_id = document.getElementById('banner-details');

        if(banner_sub_id){
          let bannerHeight = banner_sub_id?.offsetHeight;
          this.bannerHeight = bannerHeight;
        }
      }
    })
  }

  ngAfterViewInit(){
    setTimeout(() => {
      this.getDetails()
    }, 1000)
  }

  getShareableLink() {
    this.link$ = this.companiesService.getShareableLink(this.companyId)
      .pipe(
        tap(res => {
          if(res.data) {
            // this.clipboard.copy(`${environment.app_url}/companies/details?id=${this.companyId}`);
            console.log(res.data);
            this.clipboard.copy(res.data)
            this.snackBar.open(`Link copied to your clipboard`, '', {
              duration: 4000,
              panelClass: 'success-snackbar'
            });
          }
        }),
        catchError(err => of(err))
      ).subscribe();

  }

  ngOnDestroy(): void {
    if(this.link$) {
      this.link$.unsubscribe();
    }

  }

}
