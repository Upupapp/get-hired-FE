import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewPublishStepComponent } from './interview-publish-step.component';

describe('InterviewPublishStepComponent', () => {
  let component: InterviewPublishStepComponent;
  let fixture: ComponentFixture<InterviewPublishStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterviewPublishStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterviewPublishStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
