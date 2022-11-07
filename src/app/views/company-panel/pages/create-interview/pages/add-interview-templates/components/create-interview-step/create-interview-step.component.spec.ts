import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInterviewStepComponent } from './create-interview-step.component';

describe('CreateInterviewStepComponent', () => {
  let component: CreateInterviewStepComponent;
  let fixture: ComponentFixture<CreateInterviewStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateInterviewStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateInterviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
