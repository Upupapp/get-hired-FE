import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { mainAnimations } from '@main/shared/animations/main-animations';

@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.component.html',
  styleUrls: ['./account-setting.component.scss'],
  animations: [mainAnimations]
})
export class AccountSettingComponent implements OnInit {
  profileDetailsForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.profileDetailsForm = this.formBuilder.group({
      first_name: [''],
      last_name: [''],
      email: ['',/* [Validators.required]*/],
      password: ['']
    });
  }

}
