import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantDetailsMainComponent } from './applicant-details-main.component';

describe('ApplicantDetailsMainComponent', () => {
  let component: ApplicantDetailsMainComponent;
  let fixture: ComponentFixture<ApplicantDetailsMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicantDetailsMainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicantDetailsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
