import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { ImportAddCandidateComponent } from './import-add-candidate.component';
import { configureComponentTestingModule } from '../../../../../../testing/component-harness';

describe('ImportAddCandidateComponent', () => {
  let component: ImportAddCandidateComponent;
  let fixture: ComponentFixture<ImportAddCandidateComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ ImportAddCandidateComponent ],
      // The template does #auto="matAutocomplete". NO_ERRORS_SCHEMA suppresses
      // unknown elements but not an unresolved exportAs, so the real module
      // has to be present.
      imports: [ MatAutocompleteModule ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportAddCandidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
