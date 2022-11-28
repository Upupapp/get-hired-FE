import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAddCandidateComponent } from './import-add-candidate.component';

describe('ImportAddCandidateComponent', () => {
  let component: ImportAddCandidateComponent;
  let fixture: ComponentFixture<ImportAddCandidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportAddCandidateComponent ]
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
