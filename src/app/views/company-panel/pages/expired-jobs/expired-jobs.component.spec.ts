import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiredJobsComponent } from './expired-jobs.component';

describe('ExpiredJobsComponent', () => {
  let component: ExpiredJobsComponent;
  let fixture: ComponentFixture<ExpiredJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpiredJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpiredJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
