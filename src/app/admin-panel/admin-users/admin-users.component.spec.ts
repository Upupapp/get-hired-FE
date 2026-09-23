import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';

import { AdminUsersComponent } from './admin-users.component';
import { configureComponentTestingModule } from '../../../testing/component-harness';

describe('AdminUsersComponent', () => {
  let component: AdminUsersComponent;
  let fixture: ComponentFixture<AdminUsersComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ AdminUsersComponent ],
      imports: [ CommonModule ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create a user directory', () => {
    expect(component).toBeTruthy();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Users');
    expect(text).toContain('All roles');
    expect(text.toLowerCase()).not.toContain('candidate');
  });
});
