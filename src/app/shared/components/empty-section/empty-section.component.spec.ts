import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptySectionComponent } from './empty-section.component';
import { configureComponentTestingModule } from '../../../../testing/component-harness';

describe('EmptySectionComponent', () => {
  let component: EmptySectionComponent;
  let fixture: ComponentFixture<EmptySectionComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ EmptySectionComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmptySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
