import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactGroupComponent } from './contact-group.component';
import { configureComponentTestingModule } from '../../../../testing/component-harness';

describe('ContactGroupComponent', () => {
  let component: ContactGroupComponent;
  let fixture: ComponentFixture<ContactGroupComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ ContactGroupComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
