import { Component, Inject, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { mainAnimations } from '@app-shared/animations/main-animations'; 
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-access-modal',
  animations: [mainAnimations],
  templateUrl: './add-access-modal.component.html',
  styleUrls: ['./add-access-modal.component.scss']
})
export class AddAccessModalComponent implements OnInit {

  public inviteForm: FormGroup;
  public emailArray: string[] = [];
  public submitting: boolean = false;
  public importEmployee: boolean = false;
  public importing: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddAccessModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    public snackBar: MatSnackBar,
  ) {
    console.log(data)

  }

  ngOnInit(): void {
    this.inviteForm = this.formBuilder.group({
      //full_name: [this.data ? this.data?.invitation?.full_name : ''],
      email: [this.data ? this.data?.invitation?.email : '', [Validators.email]],
      /*how_did_you_know_us: [this.data ? this.data?.invitation?.how_did_you_know_us : ''],
      address: [this.data ? this.data?.invitation?.address : ''],
      phone: [this.data ? this.data?.invitation?.phone : ''],*/
    });
  }


  close() {
    this.dialogRef.close(null);
  }

  addEmployeeEmail(){
    this.emailArray.push(this.inviteForm.controls['email'].value);  
    this.inviteForm.reset();
  }

  removeEmployee(employee){
    let index = this.emailArray.findIndex(el => el === employee);  
    this.emailArray.splice(index, 1);
  }

  addMoreEmployee(){
    this.submitting = false;
    this.emailArray = [];
  }

  importUserTab(){
    this.submitting = false;
    this.emailArray = [];
    this.importEmployee = true;
  }

  convertToDateTime(dateVal: Date){
    return Math.ceil(new Date(dateVal).getTime() / 1000);
  }

  convertToDate(dateTime){
    return new Date(dateTime * 1000)
  }

  uploadedFile: any;

  onUpload(file){
    this.uploadedFile = file;
  }

  uploadDocument(){
    this.importEmployee = false;
    this.importing = true;
    this.emailArray = ["dapito.sherwin@gmail.com", "miles.gonzales@gmail.com", "kenshin.himura@gmail.com"];
  }

  submitInvites(){
    this.importing = false;
    this.submitting = true;
    this.uploadedFile = undefined;
    this.inviteForm.reset();
  }

}
