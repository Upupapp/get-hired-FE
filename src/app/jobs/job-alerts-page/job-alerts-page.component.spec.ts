import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, of } from 'rxjs';
import { SeoService } from '@app-core/services/seo.service';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { JobOpeningAlertsService } from '../job-opening-alerts.service';
import { JobAlertsPageComponent } from './job-alerts-page.component';

describe('JobAlertsPageComponent', () => {
  async function render(query: Record<string, string>, fragment: string | null): Promise<ComponentFixture<JobAlertsPageComponent>> {
    const params$ = new BehaviorSubject<ParamMap>(convertToParamMap(query));
    const fragment$ = new BehaviorSubject<string | null>(fragment);

    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, RouterTestingModule],
      declarations: [JobAlertsPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: params$.asObservable(),
            fragment: fragment$.asObservable(),
          },
        },
        {
          provide: JobOpeningAlertsService,
          useValue: { list: () => of([]), create: () => of({}), unsubscribe: () => of(undefined) },
        },
        { provide: SeoService, useValue: { setPageMeta: () => undefined } },
        { provide: SnackbarService, useValue: { success: () => undefined, error: () => undefined } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(null) }) } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(JobAlertsPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  function positionInput(fixture: ComponentFixture<JobAlertsPageComponent>): HTMLInputElement {
    return fixture.nativeElement.querySelector('#job-alert-position');
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('focuses the Position input when arriving with ?focus=add', async () => {
    const fixture = await render({ focus: 'add' }, null);
    expect(document.activeElement).toBe(positionInput(fixture));
  });

  it('focuses the Position input when arriving with #add', async () => {
    const fixture = await render({}, 'add');
    expect(document.activeElement).toBe(positionInput(fixture));
  });

  it('does not focus the Position input on a plain visit', async () => {
    const fixture = await render({}, null);
    expect(document.activeElement).not.toBe(positionInput(fixture));
  });

  it('keeps Add alert as a full-width coral control at least 44px tall', async () => {
    const fixture = await render({}, null);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.gh-alerts__submit');
    const style = getComputedStyle(button);
    const parent = button.parentElement as HTMLElement;
    const parentStyle = getComputedStyle(parent);
    const innerWidth = parent.clientWidth
      - parseFloat(parentStyle.paddingLeft)
      - parseFloat(parentStyle.paddingRight);
    expect(button.textContent).toContain('Add alert');
    expect(parseFloat(style.minHeight)).toBeGreaterThanOrEqual(44);
    expect(Math.abs(button.getBoundingClientRect().width - innerWidth)).toBeLessThan(2);
    expect(style.backgroundImage).toContain('linear-gradient');
  });
});
