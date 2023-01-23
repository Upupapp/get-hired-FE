import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewTemplateDialogComponent } from './create-new-template-dialog.component';

describe('CreateNewTemplateDialogComponent', () => {
  let component: CreateNewTemplateDialogComponent;
  let fixture: ComponentFixture<CreateNewTemplateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateNewTemplateDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewTemplateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
