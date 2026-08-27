import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewQuestionsComponent } from './interview-questions.component';
import { configureComponentTestingModule } from '../../../../../../../testing/component-harness';

describe('InterviewQuestionsComponent', () => {
  let component: InterviewQuestionsComponent;
  let fixture: ComponentFixture<InterviewQuestionsComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ InterviewQuestionsComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterviewQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
