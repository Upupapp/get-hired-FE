import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroupDirective } from '@angular/forms';

import { CreateJobPostStepComponent } from './create-job-post-step.component';
import { configureComponentTestingModule } from '../../../../../testing/component-harness';

function makeRootForm(): FormGroupDirective {
  const fb = new FormBuilder();
  const directive = new FormGroupDirective([], []);
  directive.form =  fb.group({
        jobInfo: fb.group({
          industryId: [null],
          jobRoleId: [null],
          skills: new FormArray([]),
          jobSkillsTxt: [null],
          tags: new FormArray([]),
          jobTagsTxt: [null],
          rate: [null],
          salaryMinimum: [null],
          salaryMaximum: [null],
          salaryCurrency: [null],
        }),
      });
  return directive;
}

describe('CreateJobPostStepComponent', () => {
  let component: CreateJobPostStepComponent;
  let fixture: ComponentFixture<CreateJobPostStepComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ CreateJobPostStepComponent ],
      // This step renders formControlName bindings, so the harness's permissive
      // stub form is not enough -- Angular calls registerOnChange() on whatever
      // each name resolves to, which only a real FormControl provides. Shape
      // mirrors job-create.component.ts setFormGroup().
      providers: [ { provide: FormGroupDirective, useFactory: makeRootForm } ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateJobPostStepComponent);
    component = fixture.componentInstance;
    // Required @Input()s: the component reads these during init, so a bare
    // createComponent() throws before the smoke assertion can run.
    component.formGroupName = 'jobInfo';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
