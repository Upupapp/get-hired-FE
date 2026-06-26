import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { UpdatedDialogComponent } from '@app-shared/components/updated-dialog/updated-dialog.component';
import { AuthFacade } from '@main/auth/state/auth.facade';

@Component({
  selector: 'app-employer-account-settings',
  templateUrl: './employer-account-settings.component.html',
  styleUrls: ['./employer-account-settings.component.scss'],
  animations: [mainAnimations]
})
export class EmployerAccountSettingsComponent implements OnInit {
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
