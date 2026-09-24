import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { AdminApplicationsComponent } from './admin-applications.component';
import { AdminTimeFilterComponent } from '../admin-time-filter/admin-time-filter.component';
import { configureComponentTestingModule } from '../../../testing/component-harness';

describe('AdminApplicationsComponent', () => {
  let fixture: ComponentFixture<AdminApplicationsComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [AdminApplicationsComponent, AdminTimeFilterComponent],
      imports: [CommonModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminApplicationsComponent);
    fixture.detectChanges();
  });

  it('lists applications with a time filter and search', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Applications');
    expect(text).toContain('Last 7 days');
    const search = fixture.nativeElement.querySelector('input[name="application-search"]');
    expect(search.getAttribute('placeholder')).toBe('Seeker email, name, or job title');
  });
});
