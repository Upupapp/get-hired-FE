import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { JobFacade } from '@app-job/state/job.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from '@app-job/job.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-job-post-detail-step',
  animations: [mainAnimations],
  templateUrl: './job-post-detail-step.component.html',
  styleUrls: ['./job-post-detail-step.component.scss']
})
export class JobPostDetailStepComponent implements OnInit {
  @Input() formGroupName: string;

  initialDetailsForm: FormGroup;
  workSetupSelected: number;
  badges: FormArray;
  badgeSelected = [];
  requirements: FormArray;
  goodToHave: FormArray;
  educationalBackground: FormArray;
  bannerSelected: FormArray;
  bannerUrl: string;

  workSetup$ = this.jobFacade.setup$;
  typeList$ = this.jobFacade.typeList$;
  level$ = this.jobFacade.level$;
  badge$ = this.jobFacade.badge$;
  category$ = this.jobFacade.category$;

  constructor(
    private rootFormGroup: FormGroupDirective,
    private jobFacade: JobFacade,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.populateOptions();
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    this.initialDetailsForm = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
    console.log(this.initialDetailsForm);
    this.badges = this.initialDetailsForm.get('badges') as FormArray;
    this.requirements = this.initialDetailsForm.get('requirements') as FormArray;
    this.goodToHave = this.initialDetailsForm.get('goodToHave') as FormArray;
    this.educationalBackground = this.initialDetailsForm.get('educationalBackground') as FormArray;
    this.bannerSelected = this.initialDetailsForm.get('bannerFile') as FormArray;
    this.workSetupSelected = this.initialDetailsForm.get('workSetupId').value;
    this.bannerUrl = this.initialDetailsForm.get('jobBanner').value;
  }

  populateOptions() {
    this.jobFacade.getType();
    this.jobFacade.getLevel();
    this.jobFacade.getSetup();
    this.jobFacade.getBadge();
    this.jobFacade.getCategory();
  }

  getBanner(event) {
    this.bannerSelected.removeAt(0);
    if(event && event.length == 1) {
      if(event[0].size <= 300000000) {
        this.bannerSelected.push(new FormGroup({
          file: new FormControl(event[0].file, Validators.required),
          filename: new FormControl(event[0].filename),
          size: new FormControl(event[0].size),
          type: new FormControl(event[0].type)
        }));
      } else {
        this.snackBar.open(`Banner size too large`,
        '', { duration: 4000, panelClass: ['danger-snackbar'] });
      }
    } else {
      console.log(event);
      this.snackBar.open(`Banner size too large.`,
      '', { duration: 4000, panelClass: ['danger-snackbar'] });
    }
  }

  selectWorkSetUp(chosen) {
    this.workSetupSelected = chosen;
    this.initialDetailsForm.controls.workSetupId.setValue(chosen);
  }

  addBadge(item) {
    if (this.badges.controls.length != 3) {
      let index = this.badges?.value?.findIndex(el => el?.id === item?.id);

      if(index === -1){
        this.badges.push(new FormGroup({
          icon: new FormControl(item.icon),
          name: new FormControl(item.name),
          id: new FormControl(item.id)
        }));
      }

      console.log(this.badges?.value);
    } else {
      this.snackBar.open(`You are only allowed to add up to 3 badges`,
        '', { duration: 4000, panelClass: ['danger-snackbar'] });
    }
  }



  addItem(control, controlArray: FormArray) {
    let value = this.initialDetailsForm.get(control).value;

    console.log(controlArray);

    if (value && value != '') {
      if (controlArray.controls.length != 5) {
        controlArray.push(new FormControl(value));
        this.initialDetailsForm.controls[control].setValue(null);
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

}
