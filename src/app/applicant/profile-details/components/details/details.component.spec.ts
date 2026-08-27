import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsComponent } from './details.component';
import { configureComponentTestingModule } from '../../../../../testing/component-harness';

describe('DetailsComponent', () => {
  let component: DetailsComponent;
  let fixture: ComponentFixture<DetailsComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ DetailsComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsComponent);
    component = fixture.componentInstance;
    // Required @Input()s: the component reads these during init, so a bare
    // createComponent() throws before the smoke assertion can run.
    component.user = {} as any;
    component.isApplicantView = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
