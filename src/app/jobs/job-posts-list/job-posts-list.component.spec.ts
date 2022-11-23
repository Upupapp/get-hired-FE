import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPostsListComponent } from './job-posts-list.component';

describe('JobPostsListComponent', () => {
  let component: JobPostsListComponent;
  let fixture: ComponentFixture<JobPostsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobPostsListComponent ]
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
