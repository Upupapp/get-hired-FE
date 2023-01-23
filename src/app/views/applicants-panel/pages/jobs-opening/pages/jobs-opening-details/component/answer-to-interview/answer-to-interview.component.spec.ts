import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerToInterviewComponent } from './answer-to-interview.component';

describe('AnswerToInterviewComponent', () => {
  let component: AnswerToInterviewComponent;
  let fixture: ComponentFixture<AnswerToInterviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnswerToInterviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerToInterviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
