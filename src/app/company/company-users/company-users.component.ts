import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { AddAccessModalComponent } from '@main/shared/components/add-access-modal/add-access-modal.component';
import { CompanyUser, companyUserLists } from '../company-users-model-interface';
import { TableHeader, displayedColumns, selectedColumns } from '@main/views/home/utils/job-list-model-interface';
import { Subscription, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-company-users',
  templateUrl: './company-users.component.html',
  styleUrls: ['./company-users.component.scss'],
  animations: [mainAnimations]
})
export class CompanyUsersComponent implements OnInit {
  private req: Subscription;
  private unsubscribe$ = new Subject<void>();

  public profileDetailsForm!: FormGroup;
  public companyUserLists: CompanyUser[] = companyUserLists;
  public displayedColumns: TableHeader[] = displayedColumns;
  public listView: boolean = true;
    public selectedColumns: string[] = selectedColumns
    public searchSource: any = (el) => {
      return {
        //id: el.id,
        full_name: el.full_name,
        email: el.email,
        address: el.address,
        status: el.status,
      };
    };

  public loading: boolean = true;
  constructor(private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.profileDetailsForm = this.formBuilder.group({
      first_name: [''],
      last_name: [''],
      email: ['',/* [Validators.required]*/],
      password: ['']
    });

    this.companyUserLists.forEach((el) => {
      el['full_name'] = `${el?.first_name} ${el.last_name}`;
    });

    setTimeout(() => this.loading = false, 1500);
  }


  viewMenu(event?){

  }

  addAccess(){
    let openDialog = this.dialog.open(
      AddAccessModalComponent,
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
