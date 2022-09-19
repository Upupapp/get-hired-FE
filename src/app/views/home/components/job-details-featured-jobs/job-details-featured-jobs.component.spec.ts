import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDetailsFeaturedJobsComponent } from './job-details-featured-jobs.component';

describe('JobDetailsFeaturedJobsComponent', () => {
  let component: JobDetailsFeaturedJobsComponent;
  let fixture: ComponentFixture<JobDetailsFeaturedJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobDetailsFeaturedJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDetailsFeaturedJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
