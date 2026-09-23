import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { AdminFinanceComponent } from './admin-finance.component';
import { AdminTimeFilterComponent } from '../admin-time-filter/admin-time-filter.component';
import { configureComponentTestingModule } from '../../../testing/component-harness';
import { environment } from '@environments/environment';

describe('AdminFinanceComponent', () => {
  let fixture: ComponentFixture<AdminFinanceComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [AdminFinanceComponent, AdminTimeFilterComponent],
      imports: [CommonModule],
    }).compileComponents();
  });

  beforeEach(() => {
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AdminFinanceComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('shows MRR, plan names, and fixture revenue after the finance call fails', () => {
    const req = httpMock.expectOne(request => request.url.indexOf(`${environment.api_url}/admin/finance`) === 0);
    req.flush('missing', { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Finance');
    expect(text).toContain('Last 7 days');
    expect(text).toContain('Current MRR');
    expect(text).toContain('Revenue in range');
    expect(text).toContain('Business');
    expect(text).toContain('Free trial');
    expect(text).toContain('Subscriptions');
    expect(text).toContain('Payments');
    expect(text).toContain('Amounts are fixtures until Clarence wires billing APIs.');
    expect(text).not.toContain('Premium');
    const search = fixture.nativeElement.querySelector('input[name="finance-search"]');
    expect(search.getAttribute('placeholder')).toBe('Company name');

    fixture.componentInstance.selectTab('payments');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('PayMongo');
    expect(fixture.nativeElement.querySelector('[role="tab"][aria-selected="true"]').textContent).toContain('Payments');
  });
});
