import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { month } from '@app-shared/mock.data';

@Component({
  selector: 'app-experience-qualification',
  animations: [mainAnimations],
  templateUrl: './experience-qualification.component.html',
  styleUrls: ['./experience-qualification.component.scss']
})
export class ExperienceQualificationComponent implements OnInit {
  @Input() formGroupName: string;

  arrayForm: FormGroup
  workExperience: FormArray;
  educationalBackground: FormArray;
  professionalSkills: FormArray;
  certifications: FormArray;
  skillsTxt: FormControl;

  public skill_requirements: string[] = [];
  public skillModel: string = "";

  public month: string[] = month;
  public year: number[] = new Array(18).fill(0).map((el, i) => 2005 + i);

  public jobType: string[] = ["Full-time", "Part-time"];
  public levelOfEducation: string[] = ["Primary education", "Upper Secondary Education", "Bachelor’s or equivalent level", "Master’s or equivalent level", "Doctoral or equivalent level"]

  constructor(
    private rootFormGroup: FormGroupDirective,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.arrayForm = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;

    this.workExperience = this.arrayForm.get('workExperience') as FormArray;
    this.workExperience.push(this.newWorkExperience());

    this.educationalBackground = this.arrayForm.get('educationalBackground') as FormArray;
    this.educationalBackground.push(this.newEducationalBackground());

    this.professionalSkills = this.arrayForm.get('professionalSkills') as FormArray;
    this.certifications = this.arrayForm.get('certifications') as FormArray;
    this.certifications.push(this.newCertificates());

  }

  addItem(control, controlArray: FormArray) {
    let value = this.arrayForm.get(control).value;

    console.log(controlArray);

    if (value && value != '') {
      if (controlArray.controls.length != 5) {
        controlArray.push(new FormControl(value));
        this.arrayForm.controls[control].setValue(null);
      } else {
        this.snackBar.open(`You are only allowed to add up to 5 items to this category`,
          '', { duration: 4000, panelClass: ['danger-snackbar'] });
      }
    } else {
      this.snackBar.open(`Empty string not allowed`,
        '', { duration: 4000, panelClass: ['danger-snackbar'] });
    }
  }

  removeItem(index: number, controlArray: FormArray) {
    controlArray.removeAt(index);
  }

  addMeToArray(event: { formArrayName: string; fg: FormGroup }) {
    switch (event.formArrayName) {
      case 'workExperience':
        this.workExperience.controls.unshift(event.fg);
        break;
      case 'educBg':
        this.educationalBackground.controls.unshift(event.fg);
        break;
    }
  }

  removeMeToArray(event: number) {
    this.workExperience.removeAt(event);
  }

  newWorkExperience(): FormGroup {
    return this.fb.group({
      jobTitle: [null, Validators.required],
      location: [null, Validators.required],
      isCurrentJob: [null, Validators.required],
      companyName: [null, Validators.required],
      jobTypeId: [null, Validators.required],
      startMonth: [null, Validators.required],
      startYear: [null, Validators.required],
      endMonth: [null, Validators.required],
      endYear: [null, Validators.required],
      details: [null, Validators.required],
    });
  }

  newEducationalBackground(): FormGroup {
    return this.fb.group({
      levelOfEducation: new FormControl(null),
      fieldOfStudy: new FormControl(null),
      startMonth: new FormControl(null),
      startYear: new FormControl(null),
      endMonth: new FormControl(null),
      endYear: new FormControl(null),
      school: new FormControl(null),
      schoolAddress: new FormControl(null)
    });
  }

  newCertificates(): FormGroup {
    return this.fb.group({
      certTitle: new FormControl(null),
      noExpiry: new FormControl(null),
      startMonth: new FormControl(null),
      startYear: new FormControl(null),
      endMonth: new FormControl(null),
      endYear: new FormControl(null),
      details: new FormControl(null)
    })
  }

}
