import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordInterviewComponent } from './record-interview.component';

describe('RecordInterviewComponent', () => {
  let component: RecordInterviewComponent;
  let fixture: ComponentFixture<RecordInterviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecordInterviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordInterviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
