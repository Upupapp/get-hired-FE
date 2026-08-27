import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationPreviewComponent } from './application-preview.component';
import { configureComponentTestingModule } from '../../../../../../../testing/component-harness';

describe('ApplicationPreviewComponent', () => {
  let component: ApplicationPreviewComponent;
  let fixture: ComponentFixture<ApplicationPreviewComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ ApplicationPreviewComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
