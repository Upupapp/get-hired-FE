import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPostsListComponent } from './job-posts-list.component';
import { configureComponentTestingModule } from '../../../../../testing/component-harness';

describe('JobPostsListComponent', () => {
  let component: JobPostsListComponent;
  let fixture: ComponentFixture<JobPostsListComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ JobPostsListComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobPostsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
