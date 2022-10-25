import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantDetailsAvatarComponent } from './applicant-details-avatar.component';

describe('ApplicantDetailsAvatarComponent', () => {
  let component: ApplicantDetailsAvatarComponent;
  let fixture: ComponentFixture<ApplicantDetailsAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicantDetailsAvatarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicantDetailsAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
