import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { ApplicantFacade } from '@main/applicant/state/applicant.facade';
import { month } from '@app-shared/mock.data';

@Component({
  selector: 'app-educational-background',
  animations: [mainAnimations],
  templateUrl: './educational-background.component.html',
  styleUrls: ['./educational-background.component.scss']
})
export class EducationalBackgroundComponent implements OnInit {
  @Input() controlIndex: number;
  @Input() data: any;
  @Output() arrayFormArray: EventEmitter<any> = new EventEmitter();
  @Output() removeArrayFormArray: EventEmitter<any> = new EventEmitter();

  public month: string[] = month;
  public year: number[] = new Array(30).fill(0).map((el, i) => 1995 + i);
  educBgForm: FormGroup;

  level$ = this.applicantFacade.level$;

  constructor(
    private fb: FormBuilder,
    private applicantFacade: ApplicantFacade,
  ) { }

  ngOnInit(): void {
    this.applicantFacade.getLevel();
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

  addEducationBackground(){
    this.arrayFormArray.emit({
      formArrayName: 'educBg', fg: this.educBgForm
    });
  }

  removeEducationBackground(index){
    this.removeArrayFormArray.emit({ formArrayName: 'educBg', index:index });
  }
}
