import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroupDirective } from '@angular/forms';

import { JobPostDetailStepComponent } from './job-post-detail-step.component';
import { configureComponentTestingModule } from '../../../../../testing/component-harness';

function makeRootForm(): FormGroupDirective {
  const fb = new FormBuilder();
  const directive = new FormGroupDirective([], []);
  directive.form =  fb.group({
        initialData: fb.group({
          jobTitle: [null],
          jobTypeId: [null],
          jobLevelId: [null],
          jobAddress: [null],
          jobCity: [null],
          jobCountry: [null],
          jobDescription: [null],
          jobDuties: [null],
          jobCategoryId: [null],
          workSetupId: [null],
          expirationDate: [null],
          jobBanner: [null],
          bannerFile: new FormArray([]),
          badges: new FormArray([]),
          requirements: new FormArray([]),
          goodToHave: new FormArray([]),
          educationalBackground: new FormArray([]),
          certificationRequirements: new FormArray([]),
          requirementsTxt: [null],
          goodToHaveTxt: [null],
          educationalBackgroundTxt: [null],
        }),
      });
  return directive;
}

describe('JobPostDetailStepComponent', () => {
  let component: JobPostDetailStepComponent;
  let fixture: ComponentFixture<JobPostDetailStepComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ JobPostDetailStepComponent ],
      // This step renders formControlName bindings, so the harness's permissive
      // stub form is not enough -- Angular calls registerOnChange() on whatever
      // each name resolves to, which only a real FormControl provides. Shape
      // mirrors job-create.component.ts setFormGroup().
      providers: [ { provide: FormGroupDirective, useFactory: makeRootForm } ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobPostDetailStepComponent);
    component = fixture.componentInstance;
    // Required @Input()s: the component reads these during init, so a bare
    // createComponent() throws before the smoke assertion can run.
    component.formGroupName = 'initialData';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
