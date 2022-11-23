import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { CompaniesFacade } from '../state/companies.facade';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from "@environments/environment";
import { MatSnackBar } from '@angular/material/snack-bar';

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
  public bannerHeight: number;

  details$ = this.companiesFacade.companyDetails$;

  constructor(
    private companiesFacade: CompaniesFacade,
    private router: Router,
    private route: ActivatedRoute,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
  ) {
    this.route.queryParams.subscribe(params => {
      this.companyId = params.id;
    });
  }

  ngOnInit(): void {
    this.companiesFacade.getCompany(this.companyId);
    let banner_sub_id = document.getElementById('bg-details');
    let bannerHeight = banner_sub_id?.offsetHeight + 65;
    this.bannerHeight = bannerHeight;
  }

  getShareableLink() {
    this.clipboard.copy(`${environment.app_url}/companies/details?id=${this.companyId}`);
    this.snackBar.open(`Link copied to your clipboard`, '', {
      duration: 4000,
      panelClass: 'success-snackbar'
    });

  }

}
