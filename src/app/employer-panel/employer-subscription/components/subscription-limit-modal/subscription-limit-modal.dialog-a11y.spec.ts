import { ApplicationRef } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { PlanLimitDialogService } from '@main/shared/plan-limit/plan-limit-dialog.service';
import { SubscriptionLimitModalComponent } from './subscription-limit-modal.component';
import { EMPLOYER_REFUSAL } from '../../../../../testing/plan-limit-refusal.fixture';

/**
 * B5.1 (gh-ui U4): the limit dialog as a screen reader meets it, opened through the real
 * MatDialog by the same service every screen uses.
 */
describe('Plan limit dialog -- accessible name and first focus (B5.1)', () => {
  let overlay: OverlayContainer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, NoopAnimationsModule],
      declarations: [SubscriptionLimitModalComponent],
      providers: [{ provide: Router, useValue: jasmine.createSpyObj('Router', ['navigateByUrl']) }],
    });
    overlay = TestBed.inject(OverlayContainer);
  });

  afterEach(() => {
    TestBed.inject(MatDialog).closeAll();
    overlay.ngOnDestroy();
  });

  function openDialog(): HTMLElement {
    TestBed.inject(PlanLimitDialogService).open(EMPLOYER_REFUSAL).subscribe();
    const appRef = TestBed.inject(ApplicationRef);
    appRef.tick();
    flush();
    appRef.tick();
    return overlay.getContainerElement().querySelector('mat-dialog-container') as HTMLElement;
  }

  it('is named by its visible heading through aria-labelledby, not by an aria-label on a plain div', fakeAsync(() => {
    const container = openDialog();
    const heading = container.querySelector('h2.limit-modal__title') as HTMLElement;
    expect(heading.textContent!.trim()).toBe('Active job posts limit reached');
    expect(heading.id).withContext('the heading has no id').toBeTruthy();
    expect(container.getAttribute('role')).toBe('dialog');
    expect(container.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(container.querySelector('.limit-modal[aria-label]')).toBeNull();
    flush();
  }));

  it('starts focus on that heading, not on "Close dialog"', fakeAsync(() => {
    const container = openDialog();
    expect(document.activeElement).toBe(container.querySelector('h2.limit-modal__title'));
    expect(document.activeElement).not.toBe(container.querySelector('.limit-modal__close'));
    flush();
  }));
});
