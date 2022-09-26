import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPostDetailsApplyComponent } from './job-post-details-apply.component';

describe('JobPostDetailsApplyComponent', () => {
  let component: JobPostDetailsApplyComponent;
  let fixture: ComponentFixture<JobPostDetailsApplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobPostDetailsApplyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobPostDetailsApplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
