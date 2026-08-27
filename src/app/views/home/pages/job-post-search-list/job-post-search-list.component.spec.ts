import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPostSearchListComponent } from './job-post-search-list.component';
import { configureComponentTestingModule } from '../../../../../testing/component-harness';

describe('JobPostSearchListComponent', () => {
  let component: JobPostSearchListComponent;
  let fixture: ComponentFixture<JobPostSearchListComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ JobPostSearchListComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobPostSearchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
