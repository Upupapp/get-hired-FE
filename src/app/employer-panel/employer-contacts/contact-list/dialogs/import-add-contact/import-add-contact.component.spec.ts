import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAddContactComponent } from './import-add-contact.component';
import { configureComponentTestingModule } from '../../../../../../testing/component-harness';

describe('ImportAddContactComponent', () => {
  let component: ImportAddContactComponent;
  let fixture: ComponentFixture<ImportAddContactComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ ImportAddContactComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportAddContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
