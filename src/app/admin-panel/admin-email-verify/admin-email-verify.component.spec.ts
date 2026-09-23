import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';

import { AdminEmailVerifyComponent } from './admin-email-verify.component';
import { configureComponentTestingModule } from '../../../testing/component-harness';

describe('AdminEmailVerifyComponent', () => {
  let component: AdminEmailVerifyComponent;
  let fixture: ComponentFixture<AdminEmailVerifyComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ AdminEmailVerifyComponent ],
      imports: [ CommonModule ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEmailVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('describes account verification rather than adding a candidate', () => {
    expect(component).toBeTruthy();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Email verification');
    expect(text.toLowerCase()).not.toContain('candidate');
  });

  it('reads the Email column from the template-shaped csv', () => {
    const headers = component.getHeaderArray(['First Name,Last Name,Email', '']);
    const emails = component.getDataRecordsArrayFromCSVFile(
      ['First Name,Last Name,Email', 'Mia,Test,mia@example.com'],
      headers
    );
    expect(emails).toEqual(['mia@example.com']);
  });

  it('keeps a single-column email file on the first column', () => {
    const emails = component.getDataRecordsArrayFromCSVFile(
      ['Email', 'ada@example.com'],
      ['Email']
    );
    expect(emails).toEqual(['ada@example.com']);
  });
});
