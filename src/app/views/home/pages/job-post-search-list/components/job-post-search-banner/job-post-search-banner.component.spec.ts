import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPostSearchBannerComponent } from './job-post-search-banner.component';
import { configureComponentTestingModule } from '../../../../../../../testing/component-harness';

describe('JobPostSearchBannerComponent', () => {
  let component: JobPostSearchBannerComponent;
  let fixture: ComponentFixture<JobPostSearchBannerComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ JobPostSearchBannerComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobPostSearchBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
