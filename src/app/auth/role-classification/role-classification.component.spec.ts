import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { GoogleAuthService } from '../services/google-auth.service';
import { LinkedInAuthService } from '../services/linkedin-auth.service';
import { PublicJobPreviewService } from '@main/public/services/public-job-preview.service';
import { JOB_ALERT_MODAL_SESSION_KEY } from '@main/jobs/job-opening-alerts.service';
import { RoleClassificationComponent } from './role-classification.component';

describe('RoleClassificationComponent job alert continuity', () => {
  let fixture: ComponentFixture<RoleClassificationComponent>;
  let google: {
    hasPendingRoleClassification: boolean;
    submitRoleSelection: jasmine.Spy;
    clearPendingRoleState: jasmine.Spy;
    storeSession: jasmine.Spy;
  };

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    google = {
      hasPendingRoleClassification: true,
      submitRoleSelection: jasmine.createSpy('submitRoleSelection').and.returnValue(of({
        success: true,
        data: { role: 2 },
      })),
      clearPendingRoleState: jasmine.createSpy('clearPendingRoleState'),
      storeSession: jasmine.createSpy('storeSession'),
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [RoleClassificationComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: GoogleAuthService, useValue: {
          ...google,
          pendingDisplayName: 'Ada',
          pendingEmail: 'ada@example.com',
          pendingPhotoUrl: '',
        } },
        { provide: LinkedInAuthService, useValue: {
          hasPendingRoleClassification: false,
          pendingDisplayName: '',
          pendingEmail: '',
          pendingPhotoUrl: '',
          submitRoleSelection: jasmine.createSpy('submitRoleSelection'),
          clearPendingRoleState: jasmine.createSpy('clearPendingRoleState'),
          storeSession: jasmine.createSpy('storeSession'),
        } },
        { provide: PublicJobPreviewService, useValue: { hasPendingToken: () => false } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleClassificationComponent);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('recommends and preselects job seeker when the alerts modal is waiting', () => {
    localStorage.setItem('returnURL', '/jobs?openJobAlertModal=1');
    sessionStorage.setItem(JOB_ALERT_MODAL_SESSION_KEY, '1');

    fixture.detectChanges();

    expect(fixture.componentInstance.hasJobAlertIntent).toBe(true);
    expect(fixture.componentInstance.recommendedRole).toBe('job_seeker');
    expect(fixture.componentInstance.selectedRole).toBe('job_seeker');
    expect(fixture.nativeElement.textContent).toContain('Choose Job Seeker to finish subscribing.');
  });

  it('clears the resume flag when social signup continues as an employer', () => {
    sessionStorage.setItem(JOB_ALERT_MODAL_SESSION_KEY, '1');
    localStorage.setItem('returnURL', '/jobs?openJobAlertModal=1');
    fixture.detectChanges();
    fixture.componentInstance.selectedRole = 'employer';
    spyOn(window, 'confirm').and.returnValue(true);

    fixture.componentInstance.submit();

    expect(sessionStorage.getItem(JOB_ALERT_MODAL_SESSION_KEY)).toBeNull();
    expect(google.submitRoleSelection).toHaveBeenCalledWith('employer');
  });

  it('keeps the resume flag when the employer warning is cancelled', () => {
    sessionStorage.setItem(JOB_ALERT_MODAL_SESSION_KEY, '1');
    fixture.detectChanges();
    fixture.componentInstance.selectedRole = 'employer';
    spyOn(window, 'confirm').and.returnValue(false);

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.selectedRole).toBe('job_seeker');
    expect(sessionStorage.getItem(JOB_ALERT_MODAL_SESSION_KEY)).toBe('1');
    expect(google.submitRoleSelection).not.toHaveBeenCalled();
  });
});
