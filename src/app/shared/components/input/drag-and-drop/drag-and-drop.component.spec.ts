import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragAndDropComponent } from './drag-and-drop.component';
import { configureComponentTestingModule } from '../../../../../testing/component-harness';

describe('DragAndDropComponent', () => {
  let component: DragAndDropComponent;
  let fixture: ComponentFixture<DragAndDropComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ DragAndDropComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DragAndDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
