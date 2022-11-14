import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { InviteApplicantModalComponent } from '@main/views/company-panel/pages/applicants/dialogs/invite-applicant-modal/invite-applicant-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-interview-publish-step',
  animations: [mainAnimations],
  templateUrl: './interview-publish-step.component.html',
  styleUrls: ['./interview-publish-step.component.scss']
})
export class InterviewPublishStepComponent implements OnInit {
  private req: Subscription;
  private unsubscribe$ = new Subject<void>();
  public templateForm!: FormGroup;
  
  
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
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.templateForm = this.formBuilder.group({
      live_until: ['',/* [Validators.required]*/],
      redirect_url: [''],
      display_hints: [''],
      request_availability: [''],
    });
  }

  selectAll(arr, selection){
    return arr.forEach((el) => {
      el.selected = selection;
    });
  }

  inviteInterview(event?: any){
    let openDialog = this.dialog.open(
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

    });
  }

}
