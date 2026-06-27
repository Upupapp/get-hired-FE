import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { JobFacade } from '@app-job/state/job.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from '@app-job/job.model';
import { SnackbarService } from '@app-core/services/snackbar.service';

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
  certificationRequirements: FormArray;
  bannerSelected: FormArray;
  bannerUrl: string;

  certificationTypes = ['certification', 'license', 'permit', 'eligibility', 'other'];

  workSetup$ = this.jobFacade.setup$;
  private workSetupItems: any[] = [];
  typeList$ = this.jobFacade.typeList$;
  level$ = this.jobFacade.level$;
  badge$ = this.jobFacade.badge$;
  category$ = this.jobFacade.category$;

  constructor(
    private rootFormGroup: FormGroupDirective,
    private jobFacade: JobFacade,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.populateOptions();
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    this.initialDetailsForm = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
    this.badges = this.initialDetailsForm.get('badges') as FormArray;
    this.requirements = this.initialDetailsForm.get('requirements') as FormArray;
    this.goodToHave = this.initialDetailsForm.get('goodToHave') as FormArray;
    this.educationalBackground = this.initialDetailsForm.get('educationalBackground') as FormArray;
    this.certificationRequirements = this.initialDetailsForm.get('certificationRequirements') as FormArray;
    this.bannerSelected = this.initialDetailsForm.get('bannerFile') as FormArray;
    this.workSetupSelected = this.initialDetailsForm.get('workSetupId').value;
    this.bannerUrl = this.initialDetailsForm.get('jobBanner').value;
    this.workSetup$.subscribe(items => { if (items) this.workSetupItems = items; });
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
        this.snackbarService.warning(`Banner size too large`, '');
      }
    } else {
      this.snackbarService.warning(`Please upload a single image file for the banner.`, '');
    }
  }

  selectWorkSetUp(chosen) {
    this.workSetupSelected = chosen;
    this.initialDetailsForm.controls.workSetupId.setValue(chosen);
  }

  get workSetupHelperText(): string {
    const item = this.workSetupItems.find(i => i.id === this.workSetupSelected);
    if (!item) return '';
    const n = (item.name || '').toLowerCase();
    if (n.includes('remote'))  return 'Work can be done remotely from any location.';
    if (n.includes('hybrid'))  return 'Mix of office and remote work.';
    if (n.includes('on-site') || n.includes('onsite')) return 'Work happens at a company location.';
    return item.name ? item.name + ' work arrangement.' : '';
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

    } else {
      this.snackbarService.warning(`You are only allowed to add up to 3 badges`, '');
    }
  }



  addItem(control, controlArray: FormArray) {
    let value = this.initialDetailsForm.get(control).value;

    if (value && value != '') {
      if (controlArray.controls.length != 5) {
        controlArray.push(new FormControl(value));
        this.initialDetailsForm.controls[control].setValue(null);
      } else {
        this.snackbarService.warning(`You are only allowed to add up to 5 items to this category`, '');
      }
    } else {
      this.snackbarService.warning(`Empty string not allowed`, '');
    }
  }

  removeItem(index: number, controlArray: FormArray) {
    controlArray.removeAt(index);
  }

  // GETHIRED JOB CERTIFICATION REQUIREMENTS v1 -- structured items need
  // their own add/remove (a FormGroup per item, not a single string
  // value like addItem/removeItem above). Required validation applies
  // only to the requirement name, per the command's explicit scope --
  // every other field is optional so a minimal entry never produces a
  // broken payload.
  addCertificationRequirement() {
    if (this.certificationRequirements.length >= 10) {
      this.snackbarService.warning(`You are only allowed to add up to 10 certification/license requirements`, '');
      return;
    }
    this.certificationRequirements.push(new FormGroup({
      id: new FormControl(null),
      name: new FormControl(null, Validators.required),
      type: new FormControl('certification'),
      importance: new FormControl('required'),
      issuingAuthority: new FormControl(null),
      expiryRequired: new FormControl(false),
      verificationRequired: new FormControl(false),
    }));
  }

  removeCertificationRequirement(index: number) {
    this.certificationRequirements.removeAt(index);
  }

}
