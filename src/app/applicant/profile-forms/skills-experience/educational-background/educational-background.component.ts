import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { ApplicantFacade } from '@main/applicant/state/applicant.facade';
import { month, years } from '@app-shared/mock.data';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-educational-background',
  animations: [mainAnimations],
  templateUrl: './educational-background.component.html',
  styleUrls: ['./educational-background.component.scss']
})
export class EducationalBackgroundComponent implements OnInit {

  public month: string[] = month;
  public year: number[] = years;
  educBgForm: FormGroup;

  level$ = this.applicantFacade.level$;
  public levelOfEducation: string[] = [this.translate.instant('SKILLS_AND_EXPERIENCE.PRIMAARY'), this.translate.instant('SKILLS_AND_EXPERIENCE.SECONDARY'), this.translate.instant('SKILLS_AND_EXPERIENCE.BACHELOR_DEGREE'), this.translate.instant('SKILLS_AND_EXPERIENCE.MASTERS'), this.translate.instant('SKILLS_AND_EXPERIENCE.DCOTORAL')]

  constructor(
    private fb: FormBuilder,
    private applicantFacade: ApplicantFacade,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<EducationalBackgroundComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) { }

  ngOnInit(): void {
    this.educBgForm = this.fb.group({
      levelOfEducation: new FormControl(this.data?.levelOfEducation),
      fieldOfStudy: new FormControl(this.data?.fieldOfStudy),
      school: new FormControl(this.data?.school, Validators.required),
      startMonth: new FormControl(this.data?.startMonth),
      startYear: new FormControl(this.data?.startYear),
      endMonth: new FormControl(this.data?.endMonth),
      endYear: new FormControl(this.data?.endYear),
      schoolAddress: new FormControl(this.data?.schoolAddress)
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  addEducationBackground(){
    if(this.educBgForm.valid) {
      this.dialogRef.close(this.educBgForm.value);
    }
  }

  // removeEducationBackground(index){
  //   this.removeArrayFormArray.emit({ formArrayName: 'educBg', index:index });
  // }
}
