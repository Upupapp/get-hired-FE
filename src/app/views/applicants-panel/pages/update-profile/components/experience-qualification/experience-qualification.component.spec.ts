import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceQualificationComponent } from './experience-qualification.component';

describe('ExperienceQualificationComponent', () => {
  let component: ExperienceQualificationComponent;
  let fixture: ComponentFixture<ExperienceQualificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExperienceQualificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperienceQualificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
