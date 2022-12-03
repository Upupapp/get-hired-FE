import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationPreviewComponent } from './application-preview.component';

describe('ApplicationPreviewComponent', () => {
  let component: ApplicationPreviewComponent;
  let fixture: ComponentFixture<ApplicationPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicationPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
