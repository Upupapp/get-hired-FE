import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPostDetailsComponent } from './job-post-details.component';
import { configureComponentTestingModule } from '../../../../../testing/component-harness';

describe('JobPostDetailsComponent', () => {
  let component: JobPostDetailsComponent;
  let fixture: ComponentFixture<JobPostDetailsComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ JobPostDetailsComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobPostDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
