import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordInterviewComponent } from './record-interview.component';
import { configureComponentTestingModule } from '../../../../../../../testing/component-harness';

describe('RecordInterviewComponent', () => {
  let component: RecordInterviewComponent;
  let fixture: ComponentFixture<RecordInterviewComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ RecordInterviewComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordInterviewComponent);
    component = fixture.componentInstance;
    // Required @Input()s: the component reads these during init, so a bare
    // createComponent() throws before the smoke assertion can run.
    component.interviews = [{ answerDuration: 5 } as any];
    component.index = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
