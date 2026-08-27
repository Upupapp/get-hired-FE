import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableControlModalComponent } from './table-control-modal.component';
import { configureComponentTestingModule } from '../../../../../testing/component-harness';

describe('TableControlModalComponent', () => {
  let component: TableControlModalComponent;
  let fixture: ComponentFixture<TableControlModalComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ TableControlModalComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableControlModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
