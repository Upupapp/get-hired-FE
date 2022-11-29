import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDetailsSectionComponent } from './job-details-section.component';

describe('JobDetailsSectionComponent', () => {
  let component: JobDetailsSectionComponent;
  let fixture: ComponentFixture<JobDetailsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobDetailsSectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDetailsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
