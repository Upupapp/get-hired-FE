import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateJobPostStepComponent } from './create-job-post-step.component';

describe('CreateJobPostStepComponent', () => {
  let component: CreateJobPostStepComponent;
  let fixture: ComponentFixture<CreateJobPostStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateJobPostStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateJobPostStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
