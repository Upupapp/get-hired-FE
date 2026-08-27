import { NO_ERRORS_SCHEMA, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { provideMockStore } from '@ngrx/store/testing';

// The NgRx facades are `@Injectable()` with no `providedIn`, so each feature module
// provides its own. A TestBed that only declares a component therefore has no facade
// at all. They depend on nothing but Store, which provideMockStore satisfies, so
// listing them here is enough for any component that injects one.
import { AdminFacade } from '@main/admin-panel/state/admin.facade';
import { ApplicantFacade } from '@main/applicant/state/applicant.facade';
import { ApplicationFacade } from '@main/application/state/application.facade';
import { CompaniesFacade } from '@main/companies/state/companies.facade';
import { CompanyFacade } from '@main/company/state/company.facade';
import { EmployeeFacade } from '@main/employee/state/employee.facade';
import { JobFacade } from '@main/job/state/job.facade';
import { JobsFacade } from '@main/jobs/state/jobs.facade';
import { SubscriptionsFacade } from '@main/subscriptions/state/subscriptions.facade';

/**
 * Shared TestBed setup for the component smoke tests that `ng generate` scaffolded.
 *
 * Those specs were emitted with `declarations: [Foo]` and nothing else, so every
 * component that injects anything at all threw NullInjectorError before its first
 * assertion ran -- 155 of 295 specs, none of which were reporting a real defect.
 *
 * This supplies the dependency surface those components actually use, measured from
 * their constructors rather than guessed: Router/ActivatedRoute (37/23 components),
 * MatDialogRef + MAT_DIALOG_DATA (17 each), MatDialog (10), TranslateService (7),
 * FormGroupDirective (6), FormBuilder (5), plus HttpClient for the `providedIn: 'root'`
 * services that sit behind the facades, and a mock NgRx store for the facades themselves.
 *
 * NO_ERRORS_SCHEMA is deliberate. These are instantiation smoke tests -- they assert a
 * component can be constructed, not that its template is correct -- and declaring the
 * real child components would pull most of the app into every spec. Behavioural specs
 * (company-dashboard, applicant-action-modal) configure their own TestBed and do not
 * use this helper.
 */
export interface ComponentHarnessOptions {
  declarations?: any[];
  imports?: any[];
  providers?: Provider[];
  /** Value handed to components that read MAT_DIALOG_DATA. Defaults to `{}`. */
  dialogData?: any;
}

/** Minimal MatDialogRef stub: the methods dialog components call during construction. */
export class MatDialogRefStub {
  close(_result?: any): void {}
  afterClosed() { return { subscribe: (_fn?: any) => ({ unsubscribe: () => {} }) } as any; }
  backdropClick() { return { subscribe: (_fn?: any) => ({ unsubscribe: () => {} }) } as any; }
  updateSize(_w?: string, _h?: string): void {}
  disableClose = false;
}

/**
 * The employer-contacts components read `localStorage.getItem('user')` at field-init
 * and `JSON.parse` it in ngOnInit, then use `.companyId`. With no stored user,
 * `JSON.parse(null)` yields null and the component throws before it is constructed.
 * Production always has this key by the time those routes are reachable (the role
 * guards enforce it), so seeding it restores the component's real precondition
 * rather than papering over a null-guard defect.
 */
export const TEST_USER = {
  userId: 'test-user-001',
  companyId: 'COM001',
  roleId: 2,
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
};

export function seedTestUser(user: any = TEST_USER): void {
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch {
    // Storage can be unavailable in some browser sandboxes; the specs that need
    // it will surface that themselves rather than failing here.
  }
}

/**
 * A FormGroup that answers every `get()` instead of returning null.
 *
 * The job-create steps and the apply-flow steps are child components of a parent
 * form: they inject FormGroupDirective and immediately do
 * `this.rootFormGroup.control.get(name) as FormGroup|FormArray`. A bare
 * FormGroupDirective provider has `control === null`, so those components threw
 * on `.get` of null before construction finished.
 *
 * Unknown paths resolve to an empty FormArray, which is the shape every one of
 * those call sites wants: it satisfies the `as FormArray` casts (skills, tags,
 * interviewAnswers, profileDocs.*) and still exposes `.value` for the ones that
 * read a plain control value. Controls are memoised so repeated `get()` calls
 * return the same instance, as a real form would, and the substitute is itself
 * permissive so chained lookups such as `control.get(name).get('rate').value`
 * resolve all the way down instead of hitting null at the second hop.
 */
class PermissiveFormArray extends FormArray {
  private readonly auto = new Map<string, AbstractControl>();

  constructor() {
    super([]);
  }

  override get(path: string | (string | number)[]): AbstractControl | null {
    const real = super.get(path as any);
    if (real) { return real; }
    const key = Array.isArray(path) ? path.join('.') : String(path);
    if (!this.auto.has(key)) { this.auto.set(key, new PermissiveFormArray()); }
    return this.auto.get(key)!;
  }
}

class PermissiveFormGroup extends FormGroup {
  private readonly auto = new Map<string, AbstractControl>();

  constructor() {
    super({});
  }

  override get(path: string | (string | number)[]): AbstractControl | null {
    const real = super.get(path as any);
    if (real) { return real; }
    const key = Array.isArray(path) ? path.join('.') : String(path);
    if (!this.auto.has(key)) { this.auto.set(key, new PermissiveFormArray()); }
    return this.auto.get(key)!;
  }
}

/** A FormGroupDirective whose `control` is a PermissiveFormGroup. */
export function makeRootFormGroupDirective(): FormGroupDirective {
  const directive = new FormGroupDirective([], []);
  directive.form = new PermissiveFormGroup();
  return directive;
}

export function configureComponentTestingModule(options: ComponentHarnessOptions = {}) {
  seedTestUser();

  return TestBed.configureTestingModule({
    declarations: options.declarations ?? [],
    imports: [
      HttpClientTestingModule,
      RouterTestingModule,
      NoopAnimationsModule,
      FormsModule,
      ReactiveFormsModule,
      MatDialogModule,
      MatSnackBarModule,
      TranslateModule.forRoot(),
      ...(options.imports ?? []),
    ],
    providers: [
      FormBuilder,
      { provide: FormGroupDirective, useFactory: makeRootFormGroupDirective },
      provideMockStore({}),
      AdminFacade,
      ApplicantFacade,
      ApplicationFacade,
      CompaniesFacade,
      CompanyFacade,
      EmployeeFacade,
      JobFacade,
      JobsFacade,
      SubscriptionsFacade,
      { provide: MatDialogRef, useClass: MatDialogRefStub },
      { provide: MAT_DIALOG_DATA, useValue: options.dialogData ?? {} },
      ...(options.providers ?? []),
    ],
    schemas: [NO_ERRORS_SCHEMA],
  });
}
