import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { AdminCompaniesComponent } from './admin-companies.component';
import { configureComponentTestingModule } from '../../../testing/component-harness';

describe('AdminCompaniesComponent', () => {
  let fixture: ComponentFixture<AdminCompaniesComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [AdminCompaniesComponent],
      imports: [CommonModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCompaniesComponent);
    fixture.detectChanges();
  });

  it('keeps the directory and sends company review to the detail route', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Companies');
    expect(fixture.nativeElement.querySelector('aside')).toBeNull();
    expect(text).not.toContain('Close');
  });
});
