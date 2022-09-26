import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantsPanelComponent } from './applicants-panel.component';

describe('ApplicantsPanelComponent', () => {
  let component: ApplicantsPanelComponent;
  let fixture: ComponentFixture<ApplicantsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicantsPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicantsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
