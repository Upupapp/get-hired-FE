import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsOpeningDetailsComponent } from './jobs-opening-details.component';

describe('JobsOpeningDetailsComponent', () => {
  let component: JobsOpeningDetailsComponent;
  let fixture: ComponentFixture<JobsOpeningDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsOpeningDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsOpeningDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
