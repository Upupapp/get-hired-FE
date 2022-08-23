import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReusableOrgChartComponent } from './reusable-org-chart.component';

describe('ReusableOrgChartComponent', () => {
  let component: ReusableOrgChartComponent;
  let fixture: ComponentFixture<ReusableOrgChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReusableOrgChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReusableOrgChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
