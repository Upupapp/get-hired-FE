import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewLinkAccountDetailsComponent } from './interview-link-account-details.component';

describe('InterviewLinkAccountDetailsComponent', () => {
  let component: InterviewLinkAccountDetailsComponent;
  let fixture: ComponentFixture<InterviewLinkAccountDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterviewLinkAccountDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterviewLinkAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
