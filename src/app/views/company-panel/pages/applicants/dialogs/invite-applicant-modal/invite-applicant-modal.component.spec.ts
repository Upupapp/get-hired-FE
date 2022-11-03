import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteApplicantModalComponent } from './invite-applicant-modal.component';

describe('InviteApplicantModalComponent', () => {
  let component: InviteApplicantModalComponent;
  let fixture: ComponentFixture<InviteApplicantModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InviteApplicantModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteApplicantModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
