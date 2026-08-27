import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorNotFoundComponent } from './error-not-found.component';
import { configureComponentTestingModule } from '../../../../testing/component-harness';

describe('ErrorNotFoundComponent', () => {
  let component: ErrorNotFoundComponent;
  let fixture: ComponentFixture<ErrorNotFoundComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ ErrorNotFoundComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
