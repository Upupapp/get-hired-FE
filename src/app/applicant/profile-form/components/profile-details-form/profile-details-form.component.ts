import { sanitizeIdentifier } from '@angular/compiler';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { ApplicantFacade } from '@main/applicant/state/applicant.facade';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-details-form',
  templateUrl: './profile-details-form.component.html',
  styleUrls: ['./profile-details-form.component.scss'],
  animations: [mainAnimations]
})
export class ProfileDetailsFormComponent implements OnInit {
  @Input() formGroupName: string;
  photoUrl: string;
  photo: FormControl;

  private req: Subscription;

  profileDetailsForm: FormGroup;
  profileSelected: FormControl;

  workSetup$ = this.applicantFacade.setup$;
  typeList$ = this.applicantFacade.typeList$;
  level$ = this.applicantFacade.level$;

  public title: string = '';
  public job_type: string = '';
  public job_description: string = '';
  public job_duties: string = '';
  public profileImage: any;

  constructor(
    private snackBar: MatSnackBar,
    private rootFormGroup: FormGroupDirective,
    private applicantFacade: ApplicantFacade
  ) { }

  ngOnInit(): void {
    this.applicantFacade.getType();
    this.applicantFacade.getLevel();
    this.applicantFacade.getSetup();

    this.profileDetailsForm = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
    console.log(this.profileDetailsForm);
    this.photo = this.profileDetailsForm.get('profileImage') as FormControl;
    this.photoUrl = this.profileDetailsForm.get('photoUrl').value;
  }

  onUpload(item: any) {
    this.profileImage = item;
    console.log(item);
      // this.profileDetailsForm.controls.profileImage.setValue(new FormGroup({
      //     file: new FormControl(item.file),
      //     filename: new FormControl(item.filename),
      //     size: new FormControl(item.size),
      //     type: new FormControl(item.type)
      //   }))
      // this.profileDetailsForm.controls.profileImage.setValue([{
      //   file: new FormControl(item.file),
      //   filename: new FormControl(item.filename),
      //   size: new FormControl(item.size),
      //   type: new FormControl(item.type)
      // }])

      this.profileDetailsForm.controls['profileImage'].setValue(item.file)

  }
}
