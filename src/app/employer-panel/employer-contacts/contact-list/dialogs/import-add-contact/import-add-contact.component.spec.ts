import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAddContactComponent } from './import-add-contact.component';

describe('ImportAddContactComponent', () => {
  let component: ImportAddContactComponent;
  let fixture: ComponentFixture<ImportAddContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportAddContactComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportAddContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
