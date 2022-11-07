import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInterviewTemplatesComponent } from './add-interview-templates.component';

describe('AddInterviewTemplatesComponent', () => {
  let component: AddInterviewTemplatesComponent;
  let fixture: ComponentFixture<AddInterviewTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddInterviewTemplatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddInterviewTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
