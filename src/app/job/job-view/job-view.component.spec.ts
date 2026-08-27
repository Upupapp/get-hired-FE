import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobViewComponent } from './job-view.component';
import { configureComponentTestingModule } from '../../../testing/component-harness';

describe('JobViewComponent', () => {
  let component: JobViewComponent;
  let fixture: ComponentFixture<JobViewComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ JobViewComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
