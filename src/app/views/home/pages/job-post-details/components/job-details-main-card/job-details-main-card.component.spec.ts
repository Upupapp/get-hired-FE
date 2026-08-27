import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDetailsMainCardComponent } from './job-details-main-card.component';
import { configureComponentTestingModule } from '../../../../../../../testing/component-harness';

describe('JobDetailsMainCardComponent', () => {
  let component: JobDetailsMainCardComponent;
  let fixture: ComponentFixture<JobDetailsMainCardComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ JobDetailsMainCardComponent ],
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
