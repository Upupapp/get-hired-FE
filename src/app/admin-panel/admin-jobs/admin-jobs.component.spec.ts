import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { AdminJobsComponent } from './admin-jobs.component';
import { AdminJobRow } from '../admin.model';
import { configureComponentTestingModule } from '../../../testing/component-harness';

describe('AdminJobsComponent', () => {
  let component: AdminJobsComponent;
  let fixture: ComponentFixture<AdminJobsComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [AdminJobsComponent],
      imports: [CommonModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('confirms unpublish in a dialog and does not offer a delete', () => {
    const job: AdminJobRow = {
      jobId: 'JB-1',
      title: 'Kitchen Lead',
      companyName: "Lola's Table",
      status: 2,
      statusLabel: 'Published',
      createdAt: '2026-09-01',
      applicantCount: 3,
    };
    component.pendingJob = job;
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Unpublish job?');
    expect(text).toContain('Kitchen Lead');
    expect(text).toContain('will be hidden from applicants');
    expect(text).toContain('It is not deleted.');
    expect(text).toContain('Confirm unpublish');
    expect(text).toContain('Cancel');
    expect(text.toLowerCase()).not.toContain('delete job');
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('moves initial focus to Cancel when the unpublish dialog opens', () => {
    const job: AdminJobRow = {
      jobId: 'JB-1',
      title: 'Kitchen Lead',
      companyName: "Lola's Table",
      status: 2,
      statusLabel: 'Published',
      createdAt: '2026-09-01',
      applicantCount: 3,
    };
    component.askUnpublish(job);
    fixture.detectChanges();
    const cancel = fixture.nativeElement.querySelector('#admin-unpublish-cancel');
    expect(cancel.textContent).toContain('Cancel');
    expect(document.activeElement).toBe(cancel);
  });
});
