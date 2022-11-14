import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopJobsComponent } from './top-jobs.component';

describe('TopJobsComponent', () => {
  let component: TopJobsComponent;
  let fixture: ComponentFixture<TopJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
