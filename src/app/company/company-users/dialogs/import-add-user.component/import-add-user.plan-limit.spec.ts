import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { ImportAddUserComponent } from './import-add-user.component';
import { SnackbarService } from '@app-core/services/snackbar.service';
import { HapticService } from '@app-core/services/haptic.service';
import { PlanLimitDialogService } from '@main/shared/plan-limit/plan-limit-dialog.service';
import { EMPLOYER_REFUSAL, httpFailure } from '../../../../../testing/plan-limit-refusal.fixture';

/**
 * B5: POST /company/addcompanyuser refused by the seat limit. The whole request fails with
 * HTTP 402, and the invite dialog opens the limit modal with gh-be A3's payload.
 */
describe('ImportAddUserComponent -- inviting past the seat limit (B5)', () => {
  let store: MockStore;
  let planLimitDialog: { open: jasmine.Spy };
  const COMPANY = { companyUserList: null, companyUserRes: null, pending: false, error: null, success: null };

  function create(initialError: unknown = null): ImportAddUserComponent {
    planLimitDialog = { open: jasmine.createSpy('open').and.returnValue(of(undefined)) };
    TestBed.overrideComponent(ImportAddUserComponent, { set: { template: '' } });
    TestBed.configureTestingModule({
      declarations: [ImportAddUserComponent],
      providers: [
        FormBuilder,
        provideMockStore({ initialState: { company: { ...COMPANY, error: initialError } } }),
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: SnackbarService, useValue: jasmine.createSpyObj('SnackbarService', ['success', 'error', 'warning', 'info']) },
        { provide: HapticService, useValue: jasmine.createSpyObj('HapticService', ['success', 'warning', 'error', 'selection', 'impact']) },
        { provide: PlanLimitDialogService, useValue: planLimitDialog },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    store = TestBed.inject(MockStore);
    const fixture = TestBed.createComponent(ImportAddUserComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('opens the limit modal with A3\'s refusal and stops the spinner', () => {
    const component = create();
    store.setState({ company: { ...COMPANY, pending: true } });
    store.setState({ company: { ...COMPANY, pending: false, error: httpFailure(402, EMPLOYER_REFUSAL) } });
    expect(planLimitDialog.open).toHaveBeenCalledOnceWith(EMPLOYER_REFUSAL);
    expect((component as any).loading).toBeFalse();
  });

  it('opens nothing for any other invite failure', () => {
    create();
    store.setState({ company: { ...COMPANY, error: httpFailure(500, { message: 'Server error' }) } });
    expect(planLimitDialog.open).not.toHaveBeenCalled();
  });

  it('does not replay a refusal already in the store when the dialog opens', () => {
    create(httpFailure(402, EMPLOYER_REFUSAL));
    expect(planLimitDialog.open).not.toHaveBeenCalled();
  });
});
