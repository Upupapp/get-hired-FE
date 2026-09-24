import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AuthRoleTabsComponent } from './auth-role-tabs.component';

describe('AuthRoleTabsComponent', () => {
  let fixture: ComponentFixture<AuthRoleTabsComponent>;
  let component: AuthRoleTabsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [AuthRoleTabsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthRoleTabsComponent);
    component = fixture.componentInstance;
    component.idPrefix = 'signin';
    component.ariaLabel = 'Sign in as';
    fixture.nativeElement.style.display = 'block';
    fixture.nativeElement.style.width = '375px';
    fixture.detectChanges();
  });

  function tabs(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
  }

  it('renders equal-width Employers and Job seekers tabs, defaulting to seekers', () => {
    const buttons = tabs();
    const list = fixture.nativeElement.querySelector('[role="tablist"]');

    expect(list.getAttribute('aria-label')).toBe('Sign in as');
    expect(buttons.map((button) => button.textContent.trim())).toEqual(['Employers', 'Job seekers']);
    expect(buttons[0].id).toBe('signin-tab-2');
    expect(buttons[1].id).toBe('signin-tab-3');
    expect(buttons[0].getAttribute('aria-selected')).toBe('false');
    expect(buttons[1].getAttribute('aria-selected')).toBe('true');
    expect(buttons[0].getAttribute('tabindex')).toBe('-1');
    expect(buttons[1].getAttribute('tabindex')).toBe('0');
    expect(buttons[0].getAttribute('aria-controls')).toBe('signin-panel');
    expect(buttons[1].getAttribute('aria-controls')).toBe('signin-panel');

    expect(buttons[0].offsetWidth).toBeGreaterThan(100);
    expect(Math.abs(buttons[0].offsetWidth - buttons[1].offsetWidth)).toBeLessThan(2);
    expect(buttons[0].scrollWidth).toBeLessThanOrEqual(buttons[0].clientWidth + 1);
    expect(buttons[1].scrollWidth).toBeLessThanOrEqual(buttons[1].clientWidth + 1);

    const inactive = getComputedStyle(buttons[0]);
    const active = getComputedStyle(buttons[1]);
    expect(inactive.fontFamily).toContain('Manrope');
    expect(inactive.fontWeight).toBe('600');
    expect(inactive.fontSize).toBe('14px');
    expect(inactive.minHeight).toBe('44px');
    expect(inactive.color).toBe('rgb(73, 73, 73)');
    expect(active.color).toBe('rgb(13, 16, 36)');
    expect(active.borderBottomColor).toBe('rgb(242, 82, 72)');
  });

  it('moves selection with arrow keys and keeps a single tab stop', fakeAsync(() => {
    const selected: number[] = [];
    component.roleSelected.subscribe((role) => {
      selected.push(role);
      component.activeRole = role;
    });

    const seekers = fixture.debugElement.query(By.css('#signin-tab-3'));
    seekers.triggerEventHandler('keydown', new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    }));
    tick();
    fixture.detectChanges();

    const buttons = tabs();
    expect(selected).toEqual([2]);
    expect(buttons[0].getAttribute('aria-selected')).toBe('true');
    expect(buttons[0].getAttribute('tabindex')).toBe('0');
    expect(buttons[1].getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(buttons[0]);

    const employers = fixture.debugElement.query(By.css('#signin-tab-2'));
    employers.triggerEventHandler('keydown', new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    }));
    tick();
    fixture.detectChanges();

    expect(selected).toEqual([2, 3]);
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs()[1]);
  }));

  it('emits the clicked role', () => {
    const selected: number[] = [];
    component.roleSelected.subscribe((role) => selected.push(role));

    tabs()[0].click();

    expect(selected).toEqual([2]);
  });
});
