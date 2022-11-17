import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { industries, job_role } from '@app-job/jobs-model-interface';
import { JobFacade } from '@app-job/state/job.facade';
import { FormArray, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  jobSkills: FormArray;
  jobTags: FormArray;
  jobInfoForm: FormGroup;

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
    private snackBar: MatSnackBar,
    private rootFormGroup: FormGroupDirective
  ) { }

  ngOnInit(): void {
    this.jobFacade.getIndustry();
    this.jobFacade.getJobRole();
    this.jobInfoForm = this.rootFormGroup.control.get(this.formGroupName) as FormGroup;

    this.jobSkills = this.jobInfoForm.get('jobSkills') as FormArray;
    this.jobTags = this.jobInfoForm.get('jobTags') as FormArray;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }


  addItem(control, controlArray: FormArray) {
    let value = this.jobInfoForm.get(control).value;

    console.log(controlArray);

    if (value && value != '') {
      if (controlArray.controls.length != 5) {
        controlArray.push(new FormControl(value));
        this.jobInfoForm.controls[control].setValue(null);
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

  selectRate(chosen) {
    this.selectedRates = chosen;
    this.jobInfoForm.controls.jobRate.setValue(chosen);
  }

  // searchIndustry(){
  //   const listDataSource = [...this.industries]
  //   .filter(el => {
  //     return JSON.stringify(el).toLowerCase().includes(this.search.toLowerCase());
  //   });

  //   this.industriesFiltered = listDataSource;

  // }

}
