import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { CompaniesFacade } from '../state/companies.facade';
import { Company } from '../companies.model';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from "@environments/environment";
import { SnackbarService } from '@app-core/services/snackbar.service';
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
  private loadedViaLegacyId = false;

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
    private snackbarService: SnackbarService,
    private companiesService: CompaniesService,
    private seoService: SeoService,
  ) {
    const slug = this.route.snapshot.params['slug'];
    const legacyId = this.route.snapshot.queryParams['id'];

    if (slug) {
      this.loadedViaLegacyId = false;
      this.companiesFacade.getCompanyBySlug(slug);
    } else if (legacyId) {
      this.loadedViaLegacyId = true;
      this.companyId = legacyId;
      this.companiesFacade.getCompany(legacyId);
    }
  }

  ngOnInit(): void {
    this.details$.pipe(
      filter((company: Company) => !!company && !!company.companyName),
      take(1),
    ).subscribe((company: Company) => {
      // Redirect legacy ?id= URLs to clean slug URL
      if (this.loadedViaLegacyId && company.slug) {
        this.router.navigate(['/companies', company.slug], { replaceUrl: true });
        return;
      }

      const slug = company.slug || this.companyId;
      this.seoService.setPageMeta({
        title: `${company.companyName} | GetHired Online`,
        description: `Explore ${company.companyName} on GetHired Online — view their company profile and open job positions in the Philippines.`,
        canonical: `https://gethiredonline.app/companies/${slug}`,
        robots: 'index, follow',
      });
      this.seoService.setBreadcrumbJsonLd([
        { name: 'Home', url: 'https://gethiredonline.app/home' },
        { name: 'Companies', url: 'https://gethiredonline.app/companies' },
        { name: company.companyName, url: `https://gethiredonline.app/companies/${slug}` },
      ]);
    });
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
            this.snackbarService.success(`Link copied to your clipboard`, '');
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
