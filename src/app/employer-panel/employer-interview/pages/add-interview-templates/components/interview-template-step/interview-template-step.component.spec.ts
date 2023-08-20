import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewTemplateStepComponent } from './interview-template-step.component';

describe('InterviewTemplateStepComponent', () => {
  let component: InterviewTemplateStepComponent;
  let fixture: ComponentFixture<InterviewTemplateStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterviewTemplateStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterviewTemplateStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
