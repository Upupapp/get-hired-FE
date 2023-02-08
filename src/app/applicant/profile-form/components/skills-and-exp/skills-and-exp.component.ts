import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup, FormGroupDirective } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { LoadingComponent } from '@app-shared/components/loading/loading.component';
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
  @Output() initiateSaving: EventEmitter<any> = new EventEmitter();
  arrayForm: FormGroup

  workExperience: any[] = [];
  educationalBackground: any[] = [];
  certifications: any[] = [];
  professionalSkills: any[] = [];
  // professionalSkills: FormArray;
  skillChanged = false;

  forChange = [];

  // applicant$ = this.applicantFacade.applicantTemp$
  //   .pipe().subscribe(this.getApplicantDetails.bind(this));

  constructor(
    private rootFormGroup: FormGroupDirective,
    private dialog: MatDialog,
    private applicantFacade: ApplicantFacade,
    private loadingDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.formLoading(true);
    this.arrayForm = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
    console.log(this.arrayForm);


    this.workExperience = this.arrayForm.controls['workExperience'].value ? [...this.arrayForm.controls['workExperience'].value]:[];
    this.educationalBackground = this.arrayForm.controls['educationalBackground'].value ? [...this.arrayForm.controls['educationalBackground'].value]: null;
    this.certifications = this.arrayForm.controls['certifications'].value ? [...this.arrayForm.controls['certifications'].value]: [];
    this.professionalSkills = this.arrayForm.controls['professionalSkills'].value ? [...this.arrayForm.controls['professionalSkills'].value]: null;
  }

  addSkills() {
    this.professionalSkills.push(this.arrayForm.controls['skillsTxt'].value);
    this.arrayForm.controls['skillsTxt'].reset();
    this.skillChanged = true;
  }

  submitSkills() {
    this.submittingAllArrays();
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
        this.submittingAllArrays();
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
        console.log(res);
        this.educationalBackground.push(res);
        this.submittingAllArrays();
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
        console.log(res);
        this.certifications.push(res);
        this.submittingAllArrays();
      }
    });
  }

  submittingAllArrays() {
    this.applicantFacade.setAdditionalInfo({
      workExperience: this.workExperience,
      educationalBackground: this.educationalBackground,
      professionalSkills: this.professionalSkills,
      certifications: this.certifications
    });

    setTimeout(() => {
      this.initiateSaving.emit();
      this.skillChanged = false;
    })
  }

  getApplicantDetails(data) {
    console.log(data);
  }

  // addItem(control, controlArray: FormArray) {
  //   let value = this.arrayForm.get(control).value;

  //   if (value && value != '') {
  //     if (controlArray.controls.length != 5) {
  //       controlArray.push(new FormControl(value));
  //       this.arrayForm.controls[control].setValue(null);
  //     } else {
  //       this.snackBar.open(`You are only allowed to add up to 5 items to this category`,
  //         '', { duration: 4000, panelClass: ['danger-snackbar'] });
  //     }
  //   } else {
  //     this.snackBar.open(`Empty string not allowed`,
  //       '', { duration: 4000, panelClass: ['danger-snackbar'] });
  //   }
  // }

  // removeItemInArray(index: number, controlArray: FormArray) {
  //   controlArray.removeAt(index);
  // }

  removeItem(index: number, arrayName: string) {
    switch(arrayName) {
      case 'professionalSkills':
        this.professionalSkills = this.professionalSkills.filter((skill, i) => i != index);
        this.skillChanged = true;
        break;
    }
  }

  updateArray() {

  }

  showButton(status, index) {
    this.forChange[index] = status;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    // if(this.loading$) {
    //   this.loading$.unsubscribe();
    // }
  }

  formLoading(loading: boolean) {
    if (loading) {
      const ref = this.loadingDialog.open(LoadingComponent, {
        disableClose: true,
        data: {
          selfClose: true
        }
      });
    } else {
      setTimeout(() => this.loadingDialog.closeAll(), 3000);

      // dont close automatically all modal
      // if (!this.updateSuccess) {
      //   setTimeout(() => this.loadingDialog.closeAll(), 3000);
      // }
    }
  }
}
