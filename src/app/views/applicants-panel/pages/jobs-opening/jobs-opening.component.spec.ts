import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsOpeningComponent } from './jobs-opening.component';

describe('JobsOpeningComponent', () => {
  let component: JobsOpeningComponent;
  let fixture: ComponentFixture<JobsOpeningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsOpeningComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsOpeningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
