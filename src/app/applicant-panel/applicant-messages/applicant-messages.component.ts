import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService, ApplicantThreadSummary } from '@app-shared/services/message.service';

type InboxFilter = 'all' | 'needs-reply';

/**
 * Jobseeker Messages tab -- applicant-side equivalent of
 * employer-panel/recruiter-messages. Gives applicants one place to see all
 * their own conversations with employers and reply, reusing the same
 * message.service.ts and app-message-thread shared component the recruiter
 * inbox already uses -- no duplicate messaging infrastructure.
 *
 * Scoping: GET /api/messages/applicant/threads returns only threads where
 * the authenticated caller is the applicant_uid (enforced server-side in
 * get-hired-BE/services/message.service.js's listApplicantThreads()) -- an
 * applicant can never see another jobseeker's or an employer's threads.
 */
@Component({
  selector: 'app-applicant-messages',
  templateUrl: './applicant-messages.component.html',
  styleUrls: ['./applicant-messages.component.scss'],
})
export class ApplicantMessagesComponent implements OnInit, OnDestroy {
  threads: ApplicantThreadSummary[] = [];
  filteredThreads: ApplicantThreadSummary[] = [];
  selectedThread: ApplicantThreadSummary | null = null;

  loading = true;
  error = false;
  retrying = false;

  activeFilter: InboxFilter = 'all';
  showDetail = false; // mobile: true = show thread detail instead of list

  private destroy$ = new Subject<void>();

  constructor(
    private messageService: MessageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadThreads();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadThreads(): void {
    this.loading = true;
    this.error = false;
    this.messageService
      .getApplicantThreads()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (threads) => {
          this.threads = threads ?? [];
          this.applyFilter();
          this.loading = false;
          this.retrying = false;
        },
        error: () => {
          this.loading = false;
          this.error = true;
          this.retrying = false;
        },
      });
  }

  retry(): void {
    this.retrying = true;
    this.loadThreads();
  }

  setFilter(filter: InboxFilter): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.activeFilter === 'needs-reply') {
      this.filteredThreads = this.threads.filter((t) => t.needsReply);
    } else {
      this.filteredThreads = [...this.threads];
    }
    if (
      this.selectedThread &&
      !this.filteredThreads.find((t) => t.threadId === this.selectedThread!.threadId)
    ) {
      this.selectedThread = null;
      this.showDetail = false;
    }
  }

  selectThread(thread: ApplicantThreadSummary): void {
    this.selectedThread = thread;
    this.showDetail = true; // mobile: switch to detail view
  }

  backToList(): void {
    this.showDetail = false;
  }

  threadLabel(t: ApplicantThreadSummary): string {
    const job = t.jobTitle ? `about ${t.jobTitle}` : '';
    const when = t.lastMessageAt ? `, last message ${new Date(t.lastMessageAt).toLocaleString()}` : '';
    return `Conversation ${job}${when}${t.needsReply ? ', needs your reply' : ''}`;
  }

  employerLabel(t: ApplicantThreadSummary): string {
    return t.companyName || 'Employer';
  }

  avatarInitial(t: ApplicantThreadSummary): string {
    if (t.companyName) return t.companyName.charAt(0).toUpperCase();
    return 'E';
  }

  snippet(t: ApplicantThreadSummary): string {
    if (!t.lastMessageSnippet) return 'No messages yet.';
    return t.lastMessageSnippet.length > 80
      ? t.lastMessageSnippet.slice(0, 80) + '…'
      : t.lastMessageSnippet;
  }

  goToApplications(): void {
    this.router.navigate(['/user/applications']);
  }

  goToJobs(): void {
    this.router.navigate(['/jobs']);
  }

  trackByThreadId(_i: number, t: ApplicantThreadSummary): string {
    return t.threadId;
  }
}
