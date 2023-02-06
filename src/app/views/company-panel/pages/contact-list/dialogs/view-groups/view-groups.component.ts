import { Component, Inject, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { mainAnimations } from '@app-shared/animations/main-animations'; 
import { MatSnackBar } from '@angular/material/snack-bar';
import { Group, contactGroupLists } from '../../../contact-group/utils/group-list-model-interface';

@Component({
  selector: 'app-view-groups',
  templateUrl: './view-groups.component.html',
  styleUrls: ['./view-groups.component.scss']
})
export class ViewGroupsComponent implements OnInit {
  public contactGroupLists: Group[] = contactGroupLists;

  constructor(
    public dialogRef: MatDialogRef<ViewGroupsComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    public snackBar: MatSnackBar,
  ) {
    console.log(data)

  }

  ngOnInit(): void {

  }


  close() {
    this.dialogRef.close(null);
  }

  

}
