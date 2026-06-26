import { ChangeDetectionStrategy } from '@angular/compiler';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyBasicComponent } from '@app-company/company-basic/company-basic.component';
import { UpdatedDialogComponent } from '@app-shared/components/updated-dialog/updated-dialog.component';
import { CompanyNotSetupComponent } from '@main/company/company-not-setup/company-not-setup.component';
import { EmployeeFacade } from '@main/employee/state/employee.facade';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employer-settings',
  templateUrl: './employer-settings.component.html',
  styleUrls: ['./employer-settings.component.scss']
})
export class EmployerSettingsComponent implements OnInit {
  subscriptions$ = new Subscription();

  asyncLocalStorage = {
    setItem: async function (key, value) {
      await Promise.resolve();
      localStorage.setItem(key, value);
    },
    getItem: async function (key) {
      await Promise.resolve();
      return localStorage.getItem(key);
    }
  };

  public stepperItems: any[] = [
    {
      id: 1,
      title: this.trannslate.instant('EDIT_COMPANY_DETAILS.COMPANY_DESCRIPTION'),
      disabled: false
    },
    {
      id: 2,
      title: this.trannslate.instant('EDIT_COMPANY_DETAILS.COMPANY_USER_SECTION'),
      disabled: false
    },
    {
      id: 3,
      title: this.trannslate.instant('EDIT_COMPANY_DETAILS.ACCOUNT_SETTINGS'),
      disabled: false
    },

  ];

  public stepper: number = 1;
  companyId: string;


  constructor(
    private employeeFacade: EmployeeFacade,
    private dialog: MatDialog,
    private router: Router,
    private cd: ChangeDetectorRef,
    private trannslate: TranslateService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.getUser();
  }

  changeStep(step: number): void {
    this.stepper = step;
  }

  getUser() {
    this.asyncLocalStorage.getItem('user')
      .then(details => {
        this.companyId = JSON.parse(details).companyId;

        if (!this.companyId) {
          this.createCompany();
        }
      });
  }

  createCompany() {
    let dialog = this.dialog.open(CompanyBasicComponent, {
      width: '30vw',
      disableClose: true
    });

    this.subscriptions$.add(dialog
      .afterClosed()
      .pipe()
      .subscribe((res) => {
        if (res == 1) this.dialogSuccess();
      }));

  }

  dialogSuccess() {
    const create = this.dialog.open(UpdatedDialogComponent, {
      disableClose: false,
      width: '50vw',
      data: 'Company successfully setup. Your Trial period has started. You can now access other features. You can also edit your company profile to showcase your company culture, perks and employer branding.',
    });

    this.subscriptions$.add(create
      .afterClosed()
      .pipe()
      .subscribe(() => this.router.navigate(['../../dashboard'], { relativeTo: this.route })));
  }
}
