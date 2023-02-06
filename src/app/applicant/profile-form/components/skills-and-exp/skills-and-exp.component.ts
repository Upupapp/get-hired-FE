import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup, FormGroupDirective } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { AwardsComponent } from '../awards/awards.component';
import { EducationalBackgroundComponent } from '../educational-background/educational-background.component';
import { WorkExperienceComponent } from '../work-experience/work-experience.component';

@Component({
  selector: 'app-skills-and-exp',
  templateUrl: './skills-and-exp.component.html',
  styleUrls: ['./skills-and-exp.component.scss'],
  animations: [mainAnimations]
})
export class SkillsAndExpComponent implements OnInit {
  @Input() formGroupName: string;

  arrayForm: FormGroup

  workExperience: any[] = [];
  educationalBackground: any[] = [];
  certifications: any[] = [];
  professionalSkills: FormArray;

  forChange = [];

  constructor(
    private rootFormGroup: FormGroupDirective,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.arrayForm = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
    console.log(this.arrayForm);

    this.workExperience = [...this.arrayForm.controls['workExperience'].value];
    this.educationalBackground = [...this.arrayForm.controls['educationalBackground'].value];
    this.certifications = [...this.arrayForm.controls['certifications'].value];

  }

  addWorkExperience(index?: number) {
    const ref = this.dialog.open(WorkExperienceComponent, {
      width: '70vw',
      data: index ? this.workExperience[index] : null
    });

    ref.afterClosed().subscribe(res => {
      if (res) {
        this.workExperience.push(res);
        console.log(res);
      }
    });
  }

  addEducBg() {
    const ref = this.dialog.open(EducationalBackgroundComponent, {
      width: '70vw',
      data: this.arrayForm.controls['educationalBackground'].value
    });

    ref.afterClosed().subscribe(res => {
      if (res) {
        this.educationalBackground.push(res);
        console.log(res);
      }
    });
  }

  addCertAndAwards() {
    const ref = this.dialog.open(AwardsComponent, {
      width: '70vw',
      data: this.arrayForm.controls['certifications'].value
    });

    ref.afterClosed().subscribe(res => {
      if (res) {
        this.certifications.push(res);
        console.log(res);
      }
    });
  }

  addItem(control, controlArray: FormArray) {
    // TODO
  }

  removeItem(index: number, objArray) {
    console.log(this['objArray']);
    this['objArray'].removeAt(index);
    console.log(this['objArray']);
  }

  updateArray() {

  }

  showButton(status, index) {
    this.forChange[index] = status;
  }
}
