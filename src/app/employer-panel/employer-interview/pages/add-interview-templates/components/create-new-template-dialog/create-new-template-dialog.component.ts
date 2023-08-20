import { Component, Inject, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { mainAnimations } from '@app-shared/animations/main-animations'; 
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-new-template-dialog',
  animations: [mainAnimations],
  templateUrl: './create-new-template-dialog.component.html',
  styleUrls: ['./create-new-template-dialog.component.scss']
})
export class CreateNewTemplateDialogComponent implements OnInit {
  public interviewQuestions!: FormGroup;
  public interviewInput: any = {
    question: "",  
    duration: 3,  
    number_of_retakes: 5,
  };

  public interview_questions: any[] = [{
     question: "How long have you been using Angular?",  
     duration: 3,  
     number_of_retakes: 5
   }];

  constructor(public dialogRef: MatDialogRef<CreateNewTemplateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private formBuilder: FormBuilder,
    public snackBar: MatSnackBar,) { }

  ngOnInit(): void {
  }

  addItem(){
    this.interview_questions.push(this.interviewInput);
    this.interviewInput = {
      question: "",  
      duration: 3,  
      number_of_retakes: 5,
    };
  }

  removeItem(item, arrayItem, field){
    let index = arrayItem?.findIndex(el => el?.id === item?.id);
    arrayItem.splice(index, 1);

    // rebuild request body
    //this.rebuildObject(`${field}`, arrayItem);
  }

  rebuildObject(field, data){
  }

}
