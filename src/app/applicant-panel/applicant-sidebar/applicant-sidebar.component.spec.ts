import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { MessageService } from '@app-shared/services/message.service';
import { ApplicantSidebarComponent } from './applicant-sidebar.component';

describe('ApplicantSidebarComponent job alerts', () => {
  let fixture: ComponentFixture<ApplicantSidebarComponent>;
  let component: ApplicantSidebarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ApplicantSidebarComponent],
      providers: [
        {
          provide: MessageService,
          useValue: {
            getUnreadCount: () => of(0),
            unreadCountChanged$: of(undefined),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicantSidebarComponent);
    component = fixture.componentInstance;
  });

  it('labels the bell item Job Alerts and keeps it active with a focus query', () => {
    const item = component.sidebarItems.find((entry) => entry.route === '/job-alerts');
    expect(item).toBeTruthy();
    expect(item.title).toBe('Job Alerts');
    expect(item.icon).toBe('alerts');

    component.location = '/job-alerts?focus=add';
    expect(component.isItemActive(item)).toBeTrue();

    component.location = '/job-alerts#positions';
    expect(component.isItemActive(item)).toBeTrue();
  });
});
