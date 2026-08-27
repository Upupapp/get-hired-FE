import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopJobsComponent } from './top-jobs.component';
import { configureComponentTestingModule } from '../../../../../../../testing/component-harness';

describe('TopJobsComponent', () => {
  let component: TopJobsComponent;
  let fixture: ComponentFixture<TopJobsComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ TopJobsComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopJobsComponent);
    component = fixture.componentInstance;
    // Required @Input()s: the component reads these during init, so a bare
    // createComponent() throws before the smoke assertion can run.
    component.data = {};
    component.i = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
