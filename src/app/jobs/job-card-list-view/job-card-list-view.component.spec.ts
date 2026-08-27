import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobCardListViewComponent } from './job-card-list-view.component';
import { configureComponentTestingModule } from '../../../testing/component-harness';

describe('JobCardListViewComponent', () => {
  let component: JobCardListViewComponent;
  let fixture: ComponentFixture<JobCardListViewComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ JobCardListViewComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobCardListViewComponent);
    component = fixture.componentInstance;
    // Required @Input()s: the component reads these during init, so a bare
    // createComponent() throws before the smoke assertion can run.
    component.data = {} as any;
    component.i = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
