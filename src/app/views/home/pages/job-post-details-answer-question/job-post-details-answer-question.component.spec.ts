import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPostDetailsAnswerQuestionComponent } from './job-post-details-answer-question.component';

describe('JobPostDetailsAnswerQuestionComponent', () => {
  let component: JobPostDetailsAnswerQuestionComponent;
  let fixture: ComponentFixture<JobPostDetailsAnswerQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobPostDetailsAnswerQuestionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobPostDetailsAnswerQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
