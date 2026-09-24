import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { AdminCompanyDetailComponent } from './admin-company-detail.component';
import { fixtureCompanyDetail } from '../admin.fixtures';
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
    expect(text).toContain('Overview');
    expect(text).toContain('Subscription');
    expect(text).toContain('Payments');
    expect(text).toContain('History');
    expect(text).toContain('← Companies');
    expect(text).toContain('Open jobs');
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(4);
    expect(fixture.nativeElement.querySelector('[role="tab"][aria-selected="true"]').textContent).toContain('Overview');

    fixture.componentInstance.selectTab('subscription');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Entitlement usage');
    expect(fixture.nativeElement.textContent).toContain('Growth');
    expect(fixture.nativeElement.textContent).toContain('2 / 6');
    expect(fixture.nativeElement.textContent).toContain('1 / 3');
    expect(fixture.nativeElement.textContent).toContain('8 / 100');

    fixture.componentInstance.selectTab('payments');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('All history');
    expect(fixture.nativeElement.textContent).toContain('PayMongo');

    fixture.componentInstance.selectTab('history');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Moved from Starter to Growth');
  });

  it('shows the first five CO-22 admins and +1 more', () => {
    const req = httpMock.expectOne(`${environment.api_url}/admin/companies/CO-20`);
    req.flush('missing', { status: 404, statusText: 'Not Found' });
    fixture.componentInstance.detail = fixtureCompanyDetail('CO-22', new Date('2026-09-24T04:00:00.000Z'));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(fixture.componentInstance.detail.admins.length).toBe(6);
    expect(text).toContain('Irene Santos');
    expect(text).toContain('Admin 5');
    expect(text).not.toContain('Admin 6');
    expect(text).toContain('+1 more');

    const more = Array.from(fixture.nativeElement.querySelectorAll('button'))
      .find((button: HTMLButtonElement) => (button.textContent || '').indexOf('+1 more') !== -1) as HTMLButtonElement;
    more.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Admin 6');
  });
});
