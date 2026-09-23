import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { AdminCompanyDetailComponent } from './admin-company-detail.component';
import { configureComponentTestingModule } from '../../../testing/component-harness';
import { environment } from '@environments/environment';

describe('AdminCompanyDetailComponent', () => {
  let fixture: ComponentFixture<AdminCompanyDetailComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [AdminCompanyDetailComponent],
      imports: [CommonModule],
      providers: [{
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap: convertToParamMap({ companyId: 'CO-20' }) },
          paramMap: of(convertToParamMap({ companyId: 'CO-20' })),
          queryParamMap: of(convertToParamMap({})),
        },
      }],
    }).compileComponents();
  });

  beforeEach(() => {
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AdminCompanyDetailComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('shows the employer profile, subscription, and finance link', () => {
    const req = httpMock.expectOne(`${environment.api_url}/admin/companies/CO-20`);
    req.flush('missing', { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain("Lola's Table");
    expect(text).toContain('Company admin');
    expect(text).toContain('Growth');
    expect(text).toContain('Payment history');
    expect(text).toContain('View jobs');
    expect(text).toContain('View in Finance');
    expect(text).toContain('Back to companies');
    const finance = fixture.nativeElement.querySelector('a[href*="finance"], a');
    expect(fixture.nativeElement.innerHTML).toContain('company=CO-20');
    expect(finance).toBeTruthy();
  });
});
