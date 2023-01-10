import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UpdatedDialogComponent } from '@app-shared/components/updated-dialog/updated-dialog.component';
import { AuthFacade } from '@main/auth/state/auth.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-applicant-settings',
  animations: [mainAnimations],
  templateUrl: './applicant-settings.component.html',
  styleUrls: ['./applicant-settings.component.scss']
})
export class ApplicantSettingsComponent implements OnInit {
  profileDetailsForm: FormGroup;
  user;

  profile$ = this.authFacade.profile$
    .pipe()
    .subscribe(this.setupForm.bind(this));

  success$ = this.authFacade.success$
    .pipe()
    .subscribe(this.afterChange.bind(this));

  constructor(
    private formBuilder: FormBuilder,
    private authFacade: AuthFacade,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.authFacade.getUserProfile();

    this.profileDetailsForm = this.formBuilder.group({
      firstName: [''],
      lastName: [''],
      email: [{ value: '', disabled: true }],
      password: [{ value: '', disabled: true }],
    });
  }

  setupForm(user) {
    if (user && this.profileDetailsForm) {
      this.user = user;
      const { firstName, lastName, email } = user;

      this.profileDetailsForm.get('firstName')?.setValue(firstName);
      this.profileDetailsForm.get('lastName')?.setValue(lastName);
      this.profileDetailsForm.get('email')?.setValue(email);
    }
  }

  onSubmit() {
    if (this.profileDetailsForm.valid) {
      const profile = {
        ...this.user,
        firstName: this.profileDetailsForm.controls.firstName.value,
        lastName: this.profileDetailsForm.controls.lastName.value,
      };

      this.authFacade.updateProfile(profile);
    }
  }

  afterChange(event) {
    if (event == 'updated') {
      this.dialog.open(UpdatedDialogComponent, {
        disableClose: false,
        data: 'Profile successfully updated',
      });
    }
  }

  changePw() {
    // TODO Change password
  }
}
