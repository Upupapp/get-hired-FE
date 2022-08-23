import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantSigninComponent } from './applicant-signin.component';

describe('ApplicantSigninComponent', () => {
  let component: ApplicantSigninComponent;
  let fixture: ComponentFixture<ApplicantSigninComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicantSigninComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicantSigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
