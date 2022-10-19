import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewNotificationComponent } from './interview-notification.component';

describe('InterviewNotificationComponent', () => {
  let component: InterviewNotificationComponent;
  let fixture: ComponentFixture<InterviewNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterviewNotificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterviewNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
