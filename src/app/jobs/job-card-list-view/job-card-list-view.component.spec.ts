import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobCardListViewComponent } from './job-card-list-view.component';

describe('JobCardListViewComponent', () => {
  let component: JobCardListViewComponent;
  let fixture: ComponentFixture<JobCardListViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobCardListViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobCardListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
