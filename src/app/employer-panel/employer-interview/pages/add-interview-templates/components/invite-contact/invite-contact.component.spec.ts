import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteContactComponent } from './invite-contact.component';

describe('InviteContactComponent', () => {
  let component: InviteContactComponent;
  let fixture: ComponentFixture<InviteContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InviteContactComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
