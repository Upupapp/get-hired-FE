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
  public shareWith: any[] = [
    {
      email: "joesnane@gmail.com",
      candidate: true,  
      notification: false,
    },

    {
      email: "michelscruz@amazon.com",
      candidate: true,  
      notification: false,
    },

    {
      email: "joesnane@gmail.com",
      candidate: true,  
      notification: false,
    },

    {
      email: "michelscruz@amazon.com",
      candidate: true,  
      notification: false,
    },

    {
      email: "joesnane@gmail.com",
      candidate: true,  
      notification: false,
    },

    {
      email: "michelscruz@amazon.com",
      candidate: true,  
      notification: false,
    },
  ]

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
