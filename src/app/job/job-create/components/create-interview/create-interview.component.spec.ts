import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInterviewComponent } from './create-interview.component';
import { configureComponentTestingModule } from '../../../../../testing/component-harness';

describe('CreateInterviewComponent', () => {
  let component: CreateInterviewComponent;
  let fixture: ComponentFixture<CreateInterviewComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ CreateInterviewComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateInterviewComponent);
    component = fixture.componentInstance;
    // Required @Input()s: the component reads these during init, so a bare
    // createComponent() throws before the smoke assertion can run.
    component.formGroupName = 'interview';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
