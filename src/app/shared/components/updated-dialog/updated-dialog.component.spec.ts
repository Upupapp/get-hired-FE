import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatedDialogComponent } from './updated-dialog.component';
import { configureComponentTestingModule } from '../../../../testing/component-harness';

describe('UpdatedDialogComponent', () => {
  let component: UpdatedDialogComponent;
  let fixture: ComponentFixture<UpdatedDialogComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ UpdatedDialogComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
