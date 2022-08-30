import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDetailsSidecardComponent } from './job-details-sidecard.component';

describe('JobDetailsSidecardComponent', () => {
  let component: JobDetailsSidecardComponent;
  let fixture: ComponentFixture<JobDetailsSidecardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobDetailsSidecardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDetailsSidecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
