import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { mainAnimations } from '@main/shared/animations/main-animations';
import { AuthFacade } from '../state/auth.facade';
import * as Model from '../auth.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UpdatedDialogComponent } from '@app-shared/components/updated-dialog/updated-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.component.html',
  styleUrls: ['./account-setting.component.scss'],
  animations: [mainAnimations],
})
export class AccountSettingComponent implements OnInit {
  profileDetailsForm: FormGroup;
  user: Model.User;

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

  setupForm(user: Model.User) {
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
