import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAddUserComponent } from './import-add-user.component';
import { configureComponentTestingModule } from '../../../../../testing/component-harness';

describe('ImportAddUser.ComponentComponent', () => {
  let component: ImportAddUserComponent;
  let fixture: ComponentFixture<ImportAddUserComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ ImportAddUserComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportAddUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
