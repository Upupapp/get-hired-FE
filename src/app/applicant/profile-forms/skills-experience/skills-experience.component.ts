import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from '../../applicant.model';
import { AwardsComponent } from './awards/awards.component';
import { EducationalBackgroundComponent } from './educational-background/educational-background.component';
import { WorkExperienceComponent } from './work-experience/work-experience.component';

@Component({
  selector: 'app-skills-experience',
  templateUrl: './skills-experience.component.html',
  styleUrls: ['./skills-experience.component.scss'],
  animations: [mainAnimations]
})
export class SkillsExperienceComponent implements OnInit {
  @Input() user: any;
  @Input() applicantProfileId: string;

  skillsAndExperience$ = this.applicantFacade.additionalInfo$
    .pipe().subscribe(this.fillUpArrays.bind(this));

  success$ = this.applicantFacade.success$
    .pipe().subscribe(this.afterSubmit.bind(this))

  forChange = [];
  skillsFG: FormGroup
  professionalSkills: string[];
  skillChanged: boolean;

  workExperience: Model.WorkExperience[];
  educationalBackground: Model.EducationalBackground[];
  certifications: Model.Certifications[];

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private applicantFacade: ApplicantFacade,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.skillsFG = this.fb.group({
      skillsTxt: [null, Validators.required]
    });
  }

  addSkills() {
    this.professionalSkills.push(this.skillsFG.controls['skillsTxt'].value);
    this.skillsFG.controls['skillsTxt'].reset();
    this.skillChanged = true;
  }

  addWorkExperience(index?: number) {
    const ref = this.dialog.open(WorkExperienceComponent, {
      width: '70vw',
      data: index ? this.workExperience[index] : null
    });

    ref.afterClosed().subscribe(res => {
      if (res) {
        console.log(res);
        this.workExperience.push(res);
        this.applicantFacade.saveWorkExperience(this.workExperience, this.applicantProfileId);
      }
    });
  }

  addEducBg(index?: number) {
    const ref = this.dialog.open(EducationalBackgroundComponent, {
      width: '70vw',
      data: index ? this.educationalBackground[index] : null
    });

    ref.afterClosed().subscribe(res => {
      if (res) {
        console.log(res);
        this.educationalBackground.push(res);
        this.applicantFacade.saveEducBg(this.educationalBackground, this.applicantProfileId);
      }
    });
  }

  addCertAndAwards(index?: number) {
    const ref = this.dialog.open(AwardsComponent, {
      width: '70vw',
      data: index ? this.certifications[index] : null
    });

    ref.afterClosed().subscribe(res => {
      if (res) {
        console.log(res);
        this.certifications.push(res);
        this.applicantFacade.saveCert(this.certifications, this.applicantProfileId);
      }
    });
  }

  removeItem(index: number, arrayName: string) {
    switch (arrayName) {
      case 'professionalSkills':
        this.professionalSkills = this.professionalSkills.filter((skill, i) => i != index);
        this.skillChanged = true;
        break;
    }
  }

  submitSkills() {
    this.applicantFacade.saveSkills(this.professionalSkills, this.applicantProfileId);
    this.skillChanged = false;
  }

  afterSubmit(event) {
    if (event == 'updated') {
      this.snackBar.open(`Profile successfully updated`, '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
    }
  }

  fillUpArrays(data) {
    console.log(data);
    if (data) {
      if (data.professionalSkills) {
        this.professionalSkills = [...data.professionalSkills]
      } else {
        this.professionalSkills = [];
      }

      if (data.workExperience) {
        this.workExperience = [...data.workExperience]
      } else {
        this.workExperience = [];
      }

      if (data.educationalBackground) {
        this.educationalBackground = [...data.educationalBackground]
      } else {
        this.educationalBackground = [];
      }

      if (data.certifications) {
        this.certifications = [...data.certifications]
      } else {
        this.certifications = [];
      }
    }
  }

  showButton(status, index) {
    this.forChange[index] = status;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.success$) {
      this.success$.unsubscribe();
    }

    if (this.skillsAndExperience$) {
      this.skillsAndExperience$.unsubscribe();
    }
  }

}
