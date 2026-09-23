import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { AdminTimeFilterComponent } from './admin-time-filter.component';
import { resolvePreset } from '../admin-time';
import { configureComponentTestingModule } from '../../../testing/component-harness';

describe('AdminTimeFilterComponent', () => {
  let fixture: ComponentFixture<AdminTimeFilterComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [AdminTimeFilterComponent],
      imports: [CommonModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTimeFilterComponent);
    fixture.componentInstance.range = resolvePreset('7d', new Date('2026-09-23T15:30:00.000Z'));
    fixture.detectChanges();
  });

  it('defaults the pressed preset to Last 7 days and exposes aria-pressed', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.admin-time-chip');
    expect(buttons.length).toBe(4);
    const pressed = fixture.nativeElement.querySelector('[aria-pressed="true"]');
    expect(pressed.textContent).toContain('Last 7 days');
    expect(fixture.nativeElement.textContent).toContain('Today');
    expect(fixture.nativeElement.textContent).toContain('Last 30 days');
    expect(fixture.nativeElement.textContent).toContain('Custom');
  });

  it('opens labeled date fields for a custom range', () => {
    fixture.componentInstance.range = {
      preset: 'custom',
      from: '2026-09-01',
      to: '2026-09-10',
      invalid: null,
    };
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('From');
    expect(text).toContain('To');
    expect(text).toContain('Asia/Manila');
    const from = fixture.nativeElement.querySelector('input[name="admin-range-from"]');
    expect(from.getAttribute('aria-invalid')).toBeNull();
  });
});
