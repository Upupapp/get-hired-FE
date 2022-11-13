import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPostDetailStepComponent } from './job-post-detail-step.component';

describe('JobPostDetailStepComponent', () => {
  let component: JobPostDetailStepComponent;
  let fixture: ComponentFixture<JobPostDetailStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobPostDetailStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobPostDetailStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
