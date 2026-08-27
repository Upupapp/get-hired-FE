import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDetailsBannerComponent } from './job-details-banner.component';
import { configureComponentTestingModule } from '../../../../../testing/component-harness';

describe('JobDetailsBannerComponent', () => {
  let component: JobDetailsBannerComponent;
  let fixture: ComponentFixture<JobDetailsBannerComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ JobDetailsBannerComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDetailsBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
