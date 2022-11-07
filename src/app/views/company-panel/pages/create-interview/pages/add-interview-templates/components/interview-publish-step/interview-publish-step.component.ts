import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-interview-publish-step',
  animations: [mainAnimations],
  templateUrl: './interview-publish-step.component.html',
  styleUrls: ['./interview-publish-step.component.scss']
})
export class InterviewPublishStepComponent implements OnInit {
  private req: Subscription;
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
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.templateForm = this.formBuilder.group({
      live_until: ['',/* [Validators.required]*/],
      redirect_url: [''],
      display_hints: [''],
      request_availability: [''],
    });
  }

}
