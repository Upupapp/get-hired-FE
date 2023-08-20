import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantInterviewComponent } from './applicant-interview.component';

describe('ApplicantInterviewComponent', () => {
  let component: ApplicantInterviewComponent;
  let fixture: ComponentFixture<ApplicantInterviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicantInterviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicantInterviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
