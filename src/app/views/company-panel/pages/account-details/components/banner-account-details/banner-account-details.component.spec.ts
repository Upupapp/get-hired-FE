import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerAccountDetailsComponent } from './banner-account-details.component';

describe('BannerAccountDetailsComponent', () => {
  let component: BannerAccountDetailsComponent;
  let fixture: ComponentFixture<BannerAccountDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BannerAccountDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BannerAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
