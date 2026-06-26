import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { CompaniesFacade } from '../state/companies.facade';
import { Company } from '../companies.model';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from "@environments/environment";
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompaniesService } from '../companies.service';
import { catchError, of, Subscription, tap, filter, take } from 'rxjs';
import { SeoService } from '@app-core/services/seo.service';

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
    private companiesService: CompaniesService,
    private seoService: SeoService,
  ) {
    this.route.queryParams.subscribe(params => {
      this.companyId = params.id;
    });
  }

  ngOnInit(): void {
    this.companiesFacade.getCompany(this.companyId);

    // SEO: set company page metadata once data loads
    // Phase 6: use typed Company (not `any`) — companyName is defined on the model.
    this.details$.pipe(
      filter((company: Company) => !!company && !!company.companyName),
      take(1),
    ).subscribe((company: Company) => {
      this.seoService.setPageMeta({
        title: `${company.companyName} | GetHired Online`,
        description: `Explore ${company.companyName} on GetHired Online — view their company profile and open job positions in the Philippines.`,
        canonical: `https://gethiredonline.app/companies/details?id=${this.companyId}`,
        robots: 'index, follow',
      });
      this.seoService.setBreadcrumbJsonLd([
        { name: 'Home', url: 'https://gethiredonline.app/home' },
        { name: 'Companies', url: 'https://gethiredonline.app/companies' },
        { name: company.companyName, url: `https://gethiredonline.app/companies/details?id=${this.companyId}` },
      ]);
    });

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
            this.clipboard.copy(res.data.shortLink)
            this.snackBar.open(`Link copied to your clipboard`, '', {
              duration: 4000,
              panelClass: 'success-snackbar',
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
          }
        }),
        catchError(err => of(err))
      ).subscribe();

  }

  ngOnDestroy(): void {
    // Clear company-specific breadcrumb structured data when leaving this page
    this.seoService.clearBreadcrumbJsonLd();
    if(this.link$) {
      this.link$.unsubscribe();
    }
  }

}
