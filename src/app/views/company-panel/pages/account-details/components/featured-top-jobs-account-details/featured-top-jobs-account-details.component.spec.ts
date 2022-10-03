import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedTopJobsAccountDetailsComponent } from './featured-top-jobs-account-details.component';

describe('FeaturedTopJobsAccountDetailsComponent', () => {
  let component: FeaturedTopJobsAccountDetailsComponent;
  let fixture: ComponentFixture<FeaturedTopJobsAccountDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeaturedTopJobsAccountDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturedTopJobsAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
