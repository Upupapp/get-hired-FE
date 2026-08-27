import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDetailsInterviewComponent } from './job-details-interview.component';
import { configureComponentTestingModule } from '../../../../../testing/component-harness';

describe('JobDetailsInterviewComponent', () => {
  let component: JobDetailsInterviewComponent;
  let fixture: ComponentFixture<JobDetailsInterviewComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ JobDetailsInterviewComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDetailsInterviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
