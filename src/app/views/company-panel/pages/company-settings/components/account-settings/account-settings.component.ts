import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { industries } from '../../../jobs/utils/jobs-model-interface';
import {
  displayedColumns,
  selectedColumns,
  TableHeader,
  CompanyUser,
  companyUserLists
} from '../utils/company-users-model-interface';
import { AddAccessModalComponent } from '../../dialogs/add-access-modal/add-access-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-account-settings',
  animations: [mainAnimations],
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
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
