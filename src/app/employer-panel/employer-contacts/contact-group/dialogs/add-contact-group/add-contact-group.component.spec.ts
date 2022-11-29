import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContactGroupComponent } from './add-contact-group.component';

describe('AddContactGroupComponent', () => {
  let component: AddContactGroupComponent;
  let fixture: ComponentFixture<AddContactGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddContactGroupComponent ]
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
