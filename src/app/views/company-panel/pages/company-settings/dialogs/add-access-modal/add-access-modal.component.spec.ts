import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAccessModalComponent } from './add-access-modal.component';

describe('AddAccessModalComponent', () => {
  let component: AddAccessModalComponent;
  let fixture: ComponentFixture<AddAccessModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAccessModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAccessModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
