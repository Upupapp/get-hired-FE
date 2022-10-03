import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestJobAccountDetailsComponent } from './latest-job-account-details.component';

describe('LatestJobAccountDetailsComponent', () => {
  let component: LatestJobAccountDetailsComponent;
  let fixture: ComponentFixture<LatestJobAccountDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LatestJobAccountDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LatestJobAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
