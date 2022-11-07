import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-interview-template-step',
  animations: [mainAnimations],
  templateUrl: './interview-template-step.component.html',
  styleUrls: ['./interview-template-step.component.scss']
})
export class InterviewTemplateStepComponent implements OnInit {
  private req: Subscription;
  public templateForm!: FormGroup;

  constructor(private formBuilder: FormBuilder,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.templateForm = this.formBuilder.group({
      email_template: ['',/* [Validators.required]*/],
      sms_template: [''],
      incomplete_reminder: [''],
      default_success_email: [''],
    });
  }
}
