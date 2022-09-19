import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantForgotPasswordComponent } from './applicant-forgot-password.component';

describe('ApplicantForgotPasswordComponent', () => {
  let component: ApplicantForgotPasswordComponent;
  let fixture: ComponentFixture<ApplicantForgotPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicantForgotPasswordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicantForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
