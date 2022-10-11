import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadDocumentComponent } from './file-upload-document.component';

describe('FileUploadDocumentComponent', () => {
  let component: FileUploadDocumentComponent;
  let fixture: ComponentFixture<FileUploadDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileUploadDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
