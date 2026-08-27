import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDetailsFeaturedJobsComponent } from './job-details-featured-jobs.component';
import { configureComponentTestingModule } from '../../../../../testing/component-harness';

describe('JobDetailsFeaturedJobsComponent', () => {
  let component: JobDetailsFeaturedJobsComponent;
  let fixture: ComponentFixture<JobDetailsFeaturedJobsComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ JobDetailsFeaturedJobsComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDetailsFeaturedJobsComponent);
    component = fixture.componentInstance;
    // Required @Input()s: the component reads these during init, so a bare
    // createComponent() throws before the smoke assertion can run.
    component.data = {};
    component.jobLists = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
