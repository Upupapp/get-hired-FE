import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewJobPostStepComponent } from './preview-job-post-step.component';
import { configureComponentTestingModule } from '../../../../../testing/component-harness';

describe('PreviewJobPostStepComponent', () => {
  let component: PreviewJobPostStepComponent;
  let fixture: ComponentFixture<PreviewJobPostStepComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ PreviewJobPostStepComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewJobPostStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
