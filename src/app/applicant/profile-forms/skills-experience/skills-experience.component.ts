import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';

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

  skillsFG: FormGroup
  professionalSkills: string[];
  skillChanged: boolean;

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private applicantFacade: ApplicantFacade,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.skillsFG = this.fb.group({
      skillsTxt: [null, Validators.required]
    })
  }

  addSkills() {
    this.professionalSkills.push(this.skillsFG.controls['skillsTxt'].value);
    this.skillsFG.controls['skillsTxt'].reset();
    this.skillChanged = true;
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
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if(this.success$) {
      this.success$.unsubscribe();
    }

    if(this.skillsAndExperience$) {
      this.skillsAndExperience$.unsubscribe();
    }
  }

}
