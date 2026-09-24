import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ADMIN_NAV } from './admin-nav';
import { AdminNavIconComponent } from './admin-nav-icon/admin-nav-icon.component';

describe('ADMIN_NAV', () => {
  it('places Job Alerts after Applications and before Finance', () => {
    const titles = ADMIN_NAV.map(item => item.title);
    expect(titles).toEqual([
      'Dashboard',
      'Users',
      'Jobs',
      'Companies',
      'Applications',
      'Job Alerts',
      'Finance',
      'Tools',
    ]);
    const item = ADMIN_NAV.find(entry => entry.title === 'Job Alerts');
    expect(item && item.route).toBe('job-alerts');
    expect(item && item.icon).toBe('alerts');
  });
});

describe('AdminNavIconComponent alerts', () => {
  let fixture: ComponentFixture<AdminNavIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminNavIconComponent],
    }).compileComponents();
  });

  it('draws the bell glyph and not the applications list glyph', () => {
    fixture = TestBed.createComponent(AdminNavIconComponent);
    fixture.componentInstance.name = 'alerts';
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    const paths = Array.from(svg.querySelectorAll('path')).map((path: SVGPathElement) => path.getAttribute('d'));
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('stroke-width')).toBe('2');
    expect(paths).toEqual([
      'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9',
      'M10.3 21a1.7 1.7 0 0 0 3.4 0',
    ]);
  });
});
