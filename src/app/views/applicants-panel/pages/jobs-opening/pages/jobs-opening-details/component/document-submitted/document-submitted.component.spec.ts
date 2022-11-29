import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentSubmittedComponent } from './document-submitted.component';

describe('DocumentSubmittedComponent', () => {
  let component: DocumentSubmittedComponent;
  let fixture: ComponentFixture<DocumentSubmittedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentSubmittedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentSubmittedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
