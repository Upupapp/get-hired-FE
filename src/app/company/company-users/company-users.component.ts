import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mainAnimations } from '@main/shared/animations/main-animations';
// import { AddAccessModalComponent } from '@main/shared/components/add-access-modal/add-access-modal.component';
import { TableHeader } from '@main/views/home/utils/job-list-model-interface';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { CompanyFacade } from '@app-company/state/company.facade';
import { ImportAddUserComponent } from './dialogs/import-add-user.component/import-add-user.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-company-users',
  templateUrl: './company-users.component.html',
  styleUrls: ['./company-users.component.scss'],
  animations: [mainAnimations]
})
export class CompanyUsersComponent implements OnInit {
  @Input() companyId: string;
  private req: Subscription;
  private unsubscribe$ = new Subject<void>();

  public profileDetailsForm!: FormGroup;
  // public companyUserLists: CompanyUser[] = companyUserLists;

  displayedColumns: TableHeader[] = [
    { col_name: 'employeeId', title: this.translate.instant('EDIT_COMPANY_USERS.TABLE_COLUMN_ID') },
    { col_name: 'fullName', title: 'Full Name' },
    { col_name: 'email', title: 'Email Address' },
    { col_name: 'assignedAt', title: this.translate.instant('EDIT_COMPANY_USERS.TABLE_COLUMN_DATE_ADDED'), type: 'date' },
  ];

  selectedColumns: string[] = [
    'employeeId',
    'fullName',
    'email',
    'assignedAt',
  ];

  public listView: boolean = true;
  public searchSource: any = (el) => {
    return {
      fullName: el.fullName,
      email: el.email,
      employeeId: el.employeeId,
    };
  };

  users$ = this.companyFacade.users$;

  public loading: boolean = true;
  constructor(
    private companyFacade: CompanyFacade,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.companyFacade.getCompanyUsers(this.companyId);

    this.profileDetailsForm = this.formBuilder.group({
      first_name: [''],
      last_name: [''],
      email: ['',/* [Validators.required]*/],
      password: ['']
    });

    // this.companyUserLists.forEach((el) => {
    //   el['full_name'] = `${el?.first_name} ${el.last_name}`;
    // });

    setTimeout(() => this.loading = false, 1500);
  }


  viewMenu(event?) {

  }

  addAccess() {
    let openDialog = this.dialog.open(
      ImportAddUserComponent,
      {
        width: '34vw',
        data: event,
      }
    );

    openDialog
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(result => {

      });
  }
}
