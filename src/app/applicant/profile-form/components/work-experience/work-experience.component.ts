import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from '@main/applicant/applicant.model';
import { ApplicantFacade } from '@main/applicant/state/applicant.facade';

@Component({
  selector: 'app-work-experience',
  animations: [mainAnimations],
  templateUrl: './work-experience.component.html',
  styleUrls: ['./work-experience.component.scss']
})
export class WorkExperienceComponent implements OnInit {
  @Input() arrayFormArray: FormArray
  workForm: FormGroup;

  jobType$ = this.applicantFacade.typeList$;

  public month: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  public year: number[] = new Array(30).fill(0).map((el, i) => 1995 + i);
  public jobType: string[] = ["Full-time", "Part-time"];
  public levelOfEducation: string[] = ["Primary education", "Upper Secondary Education", "Bachelor’s or equivalent level", "Master’s or equivalent level", "Doctoral or equivalent level"]

  // @Input() work_experience: {
  //   title: string,
  //   job_type: string,
  //   details: string,
  //   location: string,
  //   company: string,
  //   start_date: any,
  //   end_date: any,
  //   currently_work_here: boolean
  // };

  // @Input() index : number = 1;
  // @Input() length: number = 1;

  // @Output() addExperienceEvent: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private applicantFacade: ApplicantFacade
  ) { }

  ngOnInit(): void {
    this.workForm = this.fb.group({
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


    // this.start_date  = {
    //   month: this.month[this.work_experience?.start_date?.getMonth()],
    //   year: this.work_experience?.start_date?.getFullYear()
    // }

    // this.end_date  = {
    //   month: this.month[this.work_experience?.end_date?.getMonth()],
    //   year: this.work_experience?.end_date?.getFullYear()
    // }
  }

  addWorkExp() {
    this.arrayFormArray.push(this.workForm);
    this.workForm.reset();
  }

  // addExperience(){
  //   this.addExperienceEvent.emit(true);
  // }

  // removeExperience(index){
  //   this.addExperienceEvent.emit({
  //     index: index
  //   });
  // }
}
