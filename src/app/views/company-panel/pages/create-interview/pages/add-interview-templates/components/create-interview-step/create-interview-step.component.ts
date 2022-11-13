import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Job, jobLists } from '@main/views/company-panel/pages/jobs/utils/jobs-model-interface';

@Component({
  selector: 'app-create-interview-step',
  animations: [mainAnimations],
  templateUrl: './create-interview-step.component.html',
  styleUrls: ['./create-interview-step.component.scss']
})
export class CreateInterviewStepComponent implements OnInit {
  private req: Subscription;
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

  public jobLists: Job[] = jobLists;

  constructor(private formBuilder: FormBuilder,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.interviewQuestions = this.formBuilder.group({
      template_title: ['',/* [Validators.required]*/],
      created_by: [''],
      job_id: ['']
    });
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
