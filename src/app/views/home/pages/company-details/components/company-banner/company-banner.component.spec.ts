import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyBannerComponent } from './company-banner.component';
import { configureComponentTestingModule } from '../../../../../../../testing/component-harness';

describe('CompanyBannerComponent', () => {
  let component: CompanyBannerComponent;
  let fixture: ComponentFixture<CompanyBannerComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ CompanyBannerComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
