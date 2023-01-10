import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from '@main/applicant/applicant.model';
import { ApplicantFacade } from '@main/applicant/state/applicant.facade';
import { month } from '@app-shared/mock.data';

@Component({
  selector: 'app-work-experience',
  animations: [mainAnimations],
  templateUrl: './work-experience.component.html',
  styleUrls: ['./work-experience.component.scss']
})
export class WorkExperienceComponent implements OnInit {
  @Input() controlIndex: number;
  @Input() data: any;
  @Output() arrayFormArray: EventEmitter<any> = new EventEmitter();
  @Output() removeArrayFormArray: EventEmitter<any> = new EventEmitter();

  workForm: FormGroup;

  jobType$ = this.applicantFacade.typeList$;

  public month: string[] = month;
  public year: number[] = new Array(30).fill(0).map((el, i) => 1995 + i);

  constructor(
    private fb: FormBuilder,
    private applicantFacade: ApplicantFacade,
  ) { }

  ngOnInit(): void {
    this.workForm = this.fb.group({
      jobTitle: new FormControl(this.data?.jobTitle, Validators.required),
      location: new FormControl(this.data?.location, Validators.required),
      isCurrentJob: new FormControl(this.data?.isCurrentJob),
      companyName: new FormControl(this.data?.companyName, Validators.required),
      jobTypeId: new FormControl(this.data?.jobTypeId, Validators.required),
      startMonth: new FormControl(this.data?.startMonth, Validators.required),
      startYear: new FormControl(this.data?.startYear, Validators.required),
      endMonth: new FormControl(this.data?.endMonth),
      endYear: new FormControl(this.data?.endYear),
      details: new FormControl(this.data?.details, Validators.required)
    });
  }

  addWorkExp() {
    this.arrayFormArray.emit({
      formArrayName: 'workExperience', fg: this.workForm, index: this.controlIndex
    });
  }

  removeWorkExp(index) {
    this.removeArrayFormArray.emit({ formArrayName: 'workExperience', index:index });
  }
}
