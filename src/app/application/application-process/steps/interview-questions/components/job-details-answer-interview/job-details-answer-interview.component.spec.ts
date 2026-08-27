import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDetailsAnswerInterviewComponent } from './job-details-answer-interview.component';
import { configureComponentTestingModule } from '../../../../../../../testing/component-harness';

describe('JobDetailsAnswerInterviewComponent', () => {
  let component: JobDetailsAnswerInterviewComponent;
  let fixture: ComponentFixture<JobDetailsAnswerInterviewComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ JobDetailsAnswerInterviewComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDetailsAnswerInterviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
