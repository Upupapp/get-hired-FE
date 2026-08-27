import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatTotalComponent } from './stat-total.component';
import { configureComponentTestingModule } from '../../../../../testing/component-harness';

describe('StatTotalComponent', () => {
  let component: StatTotalComponent;
  let fixture: ComponentFixture<StatTotalComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ StatTotalComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatTotalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
