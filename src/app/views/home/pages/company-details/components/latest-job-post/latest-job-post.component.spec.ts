import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestJobPostComponent } from './latest-job-post.component';

describe('LatestJobPostComponent', () => {
  let component: LatestJobPostComponent;
  let fixture: ComponentFixture<LatestJobPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LatestJobPostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LatestJobPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
