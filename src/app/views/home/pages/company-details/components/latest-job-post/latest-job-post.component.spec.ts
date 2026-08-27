import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestJobPostComponent } from './latest-job-post.component';
import { configureComponentTestingModule } from '../../../../../../../testing/component-harness';

describe('LatestJobPostComponent', () => {
  let component: LatestJobPostComponent;
  let fixture: ComponentFixture<LatestJobPostComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ LatestJobPostComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LatestJobPostComponent);
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
