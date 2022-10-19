import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDetailsMainCardComponent } from './job-details-main-card.component';

describe('JobDetailsMainCardComponent', () => {
  let component: JobDetailsMainCardComponent;
  let fixture: ComponentFixture<JobDetailsMainCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobDetailsMainCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDetailsMainCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
