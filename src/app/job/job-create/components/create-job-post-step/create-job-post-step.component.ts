import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { industries, job_role } from '@app-job/jobs-model-interface';
import { JobFacade } from '@app-job/state/job.facade';
import { FormArray, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { currencies } from '@app-shared/mock.data';

@Component({
  selector: 'app-create-job-post-step',
  animations: [mainAnimations],
  templateUrl: './create-job-post-step.component.html',
  styleUrls: ['./create-job-post-step.component.scss']
})
export class CreateJobPostStepComponent implements OnInit {
  @Input() formGroupName: any;

  industry$ = this.jobFacade.industry$;
  jobRoles$ = this.jobFacade.jobRole$;

  skills: FormArray;
  tags: FormArray;
  jobInfoForm: FormGroup;
  salaryCurrencies = currencies;

  public search: string = "";
  public rates: any[] = [
    {
      id:1,
      title: "Monthly",
      rate: "month",
      icon: '/rate-monthly'
    },
    {
      id: 2,
      title: "Daily",
      rate: "day",
      icon: '/rate-daily'
    },
    {
      id: 3,
      title: "Hourly",
      rate: "hour",
      icon: '/rate-24'
    },
  ];

  public selectedRates: any = "";
  public budget: any = {
    min: 0,
    max: 0
  }
  public project_duration = {
    start_date: new Date(),
    end_date: new Date()
  }

  public skillModel: string = "";
  public tagModel: string = "";
  public months: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  public days: number[] = new Array(31).fill(1).map((el,i) => i + 1);

  constructor(
    private jobFacade: JobFacade,
    private snackbarService: SnackbarService,
    private rootFormGroup: FormGroupDirective
  ) { }

  ngOnInit(): void {
    this.jobFacade.getIndustry();
    this.jobFacade.getJobRole();
    this.jobInfoForm = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;
    this.skills = this.jobInfoForm.get('skills') as FormArray;
    this.tags = this.jobInfoForm.get('tags') as FormArray;
    this.selectedRates = this.jobInfoForm.get('rate').value;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }


  addItem(control, controlArray: FormArray) {
    let value = this.jobInfoForm.get(control).value;

    if (value && value != '') {
      if (controlArray.controls.length != 5) {
        controlArray.push(new FormControl(value));
        this.jobInfoForm.controls[control].setValue(null);
      } else {
        this.snackbarService.warning(`You are only allowed to add up to 5 items to this category`, '');
      }
    }
  }

  removeItem(index: number, controlArray: FormArray) {
    controlArray.removeAt(index);
  }

  selectRate(chosen) {
    this.selectedRates = chosen.title;
    this.jobInfoForm.controls.rate.setValue(chosen.title);
  }

  // searchIndustry(){
  //   const listDataSource = [...this.industries]
  //   .filter(el => {
  //     return JSON.stringify(el).toLowerCase().includes(this.search.toLowerCase());
  //   });

  //   this.industriesFiltered = listDataSource;

  // }

}
