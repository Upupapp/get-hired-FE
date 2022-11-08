import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewJobPostComponent } from './view-job-post.component';

describe('ViewJobPostComponent', () => {
  let component: ViewJobPostComponent;
  let fixture: ComponentFixture<ViewJobPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewJobPostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewJobPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
