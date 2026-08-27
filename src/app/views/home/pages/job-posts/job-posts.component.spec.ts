import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPostsComponent } from './job-posts.component';
import { configureComponentTestingModule } from '../../../../../testing/component-harness';

describe('JobPostsComponent', () => {
  let component: JobPostsComponent;
  let fixture: ComponentFixture<JobPostsComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ JobPostsComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
