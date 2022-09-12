import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPostStepperComponent } from './job-post-stepper.component';

describe('JobPostStepperComponent', () => {
  let component: JobPostStepperComponent;
  let fixture: ComponentFixture<JobPostStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobPostStepperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobPostStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
