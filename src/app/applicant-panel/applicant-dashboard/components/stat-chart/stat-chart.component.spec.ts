import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatChartComponent } from './stat-chart.component';
import { configureComponentTestingModule } from '../../../../../testing/component-harness';

describe('StatChartComponent', () => {
  let component: StatChartComponent;
  let fixture: ComponentFixture<StatChartComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ StatChartComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatChartComponent);
    component = fixture.componentInstance;
    // Required @Input()s: the component reads these during init, so a bare
    // createComponent() throws before the smoke assertion can run.
    component.charts = { application: 0, interviews: 0, profileView: [], jobApplication: [] };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
