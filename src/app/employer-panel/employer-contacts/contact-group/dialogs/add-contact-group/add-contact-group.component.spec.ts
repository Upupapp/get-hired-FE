import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContactGroupComponent } from './add-contact-group.component';
import { configureComponentTestingModule } from '../../../../../../testing/component-harness';

describe('AddContactGroupComponent', () => {
  let component: AddContactGroupComponent;
  let fixture: ComponentFixture<AddContactGroupComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ AddContactGroupComponent ],
      // ngOnInit iterates data.details when data is truthy, so the harness's
      // default `{}` throws. This is the edit-an-existing-group shape.
      dialogData: { group_name: 'Test Group', details: [] },
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddContactGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
