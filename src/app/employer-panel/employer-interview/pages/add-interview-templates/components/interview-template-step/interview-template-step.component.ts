import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Job, jobLists } from '@main/views/company-panel/pages/jobs/utils/jobs-model-interface';
//import { InviteApplicantModalComponent } from '@main/views/company-panel/pages/applicants/dialogs/invite-applicant-modal/invite-applicant-modal.component';
import { CreateNewTemplateDialogComponent } from '../create-new-template-dialog/create-new-template-dialog.component';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-interview-template-step',
  animations: [mainAnimations],
  templateUrl: './interview-template-step.component.html',
  styleUrls: ['./interview-template-step.component.scss']
})
export class InterviewTemplateStepComponent implements OnInit {
  private req: Subscription;
  private unsubscribe$ = new Subject<void>();
  
  public templateForm!: FormGroup;
  public interview_questions: any[] = [
    {
      name: "Web Development Interview Questions",  
      number_of_interview: 5,  
    },

    {
      name: "Business Management Interview Questions",  
      number_of_interview: 5,  
    },   

    {
      name: "Backend Developer Interview Sets",  
      number_of_interview: 5,  
    }, 
  ];
  public jobLists: Job[] = jobLists;


  /* TABLE DATA */
  /* GROUP CONTACTS */
  public selectAllGroup: boolean = false;
  public groupContact: any[] = [
    {
      name: "HR Group",
      selected: false,
      id: 1
    },

    {
      name: "Web Development Team",
      selected: false,
      id: 2
    },
  ];

  /* INDIVIDUAL EMAILS */
  public selectAllIndividual: boolean = false;
  public individualEmail: any[] = [
    {
      email: "joesnane@gmail.com",
      selected: false,
      id: 1
    },

    {
      email: "michelscruz@amazon.com",
      selected: false,
      id: 2
    },

    {
      email: "joesnane@gmail.com",
      selected: false,
      id: 3
    },

    {
      email: "michelscruz@amazon.com",
      selected: false,
      id: 4
    },

    {
      email: "joesnane@gmail.com",
      selected: false,
      id: 5
    },

    {
      email: "michelscruz@amazon.com",
      selected: false,
      id: 6
    },
  ];

  /* EMAIL BY JOB POST */
  public selectAllEmail: boolean = false;
  public emailByJobPost: any[] = [
    {
      email: "joesnane@gmail.com",
      selected: false,
      id: 101
    },

    {
      email: "michelscruz@amazon.com",
      selected: false,
      id: 102
    },

    {
      email: "joesnane@gmail.com",
      selected: false,
      id: 103
    },
  ];

  constructor(private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private location: Location,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.templateForm = this.formBuilder.group({
      template_title: ['',/* [Validators.required]*/],
      job_id: [''],
      external_job_link: [''], 
      interview_template: ['']
    });

    this.jobLists.forEach(el => {
      el['name'] = ` [${el?.id}] ${el?.title} - ${el?.work_setup}, ${el?.job_type}`
    });
  }

  getBack(){
    this.location.back();
  }

  selectAll(arr, selection){
    return arr.forEach((el) => {
      el.selected = selection;
    });
  }

  inviteInterview(event?: any){
    /*let openDialog = this.dialog.open(
      InviteApplicantModalComponent,
      { 
        width: '34vw',
        data: {
          ...event,  
          title: "User",
          sub_title: "user"
        },
      }
    );

    openDialog
    .afterClosed()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(result => {

    });*/
  }

  createNewTemplateInterview(){
    let openDialog = this.dialog.open(
      CreateNewTemplateDialogComponent,
      { 
        minWidth: '74vw',
        minHeight: '85vh',
        maxHeight: '95vh',
      }
    );

    openDialog
    .afterClosed()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(result => {

    });
  }
}
