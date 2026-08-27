import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantAvatarComponent } from './applicant-avatar.component';
import { configureComponentTestingModule } from '../../../../../../../../../testing/component-harness';

describe('ApplicantAvatarComponent', () => {
  let component: ApplicantAvatarComponent;
  let fixture: ComponentFixture<ApplicantAvatarComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ ApplicantAvatarComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicantAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
