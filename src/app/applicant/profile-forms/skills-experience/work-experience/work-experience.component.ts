import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from '@main/applicant/applicant.model';
import { ApplicantFacade } from '@main/applicant/state/applicant.facade';
import { month } from '@app-shared/mock.data';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-work-experience',
  animations: [mainAnimations],
  templateUrl: './work-experience.component.html',
  styleUrls: ['./work-experience.component.scss']
})
export class WorkExperienceComponent implements OnInit {
  // @Input() controlIndex: number;
  // @Input() data: any;
  // @Output() arrayFormArray: EventEmitter<any> = new EventEmitter();
  // @Output() removeArrayFormArray: EventEmitter<any> = new EventEmitter();

  workForm: FormGroup;

  jobType$ = this.applicantFacade.typeList$;

  public month: string[] = month;
  public year: number[] = new Array(30).fill(0).map((el, i) => 1995 + i);

  constructor(
    private fb: FormBuilder,
    private applicantFacade: ApplicantFacade,
    public dialogRef: MatDialogRef<WorkExperienceComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) { }

  ngOnInit(): void {
    console.log(this.data);
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
    }, { validators: WorkExperienceComponent.dateRangeValidator });

    // PROFILE-SETUP PHASE 1 (Experience validation): end date is required
    // for a past role -- current-role semantics (hidden/optional end date
    // when isCurrentJob is checked) are unchanged, this only closes the gap
    // where a PAST role could previously be saved with no end date at all.
    this.updateEndDateValidators(!!this.data?.isCurrentJob);
    this.workForm.get('isCurrentJob').valueChanges.subscribe((isCurrent: boolean) => {
      this.updateEndDateValidators(isCurrent);
    });
  }

  private updateEndDateValidators(isCurrentJob: boolean): void {
    const endMonth = this.workForm.get('endMonth');
    const endYear = this.workForm.get('endYear');
    if (isCurrentJob) {
      endMonth.clearValidators();
      endYear.clearValidators();
    } else {
      endMonth.setValidators(Validators.required);
      endYear.setValidators(Validators.required);
    }
    endMonth.updateValueAndValidity();
    endYear.updateValueAndValidity();
  }

  /**
   * PROFILE-SETUP PHASE 1 (Experience validation): rejects an end date
   * that precedes the start date. No-ops (returns null) whenever any of
   * the 4 date fields aren't filled yet, or the role is marked current
   * (end date fields are cleared of requirement in that case) -- this
   * validator only ever fires the specific "end before start" case, it
   * never duplicates the individual required-field validators above.
   */
  private static dateRangeValidator(group: AbstractControl) {
    const isCurrentJob = group.get('isCurrentJob')?.value;
    const startMonth = group.get('startMonth')?.value;
    const startYear = group.get('startYear')?.value;
    const endMonth = group.get('endMonth')?.value;
    const endYear = group.get('endYear')?.value;
    if (isCurrentJob || !startMonth || !startYear || !endMonth || !endYear) {
      return null;
    }
    const monthIndex = (m: string) => month.indexOf(m);
    const startValue = Number(startYear) * 12 + monthIndex(startMonth);
    const endValue = Number(endYear) * 12 + monthIndex(endMonth);
    if (endValue < startValue) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  addWorkExp() {
    if(this.workForm.valid) {
      this.dialogRef.close(this.workForm.value);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
