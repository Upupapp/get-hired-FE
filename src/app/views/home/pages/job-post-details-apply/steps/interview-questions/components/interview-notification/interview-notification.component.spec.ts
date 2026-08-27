import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewNotificationComponent } from './interview-notification.component';
import { configureComponentTestingModule } from '../../../../../../../../../testing/component-harness';

describe('InterviewNotificationComponent', () => {
  let component: InterviewNotificationComponent;
  let fixture: ComponentFixture<InterviewNotificationComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ InterviewNotificationComponent ],
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
