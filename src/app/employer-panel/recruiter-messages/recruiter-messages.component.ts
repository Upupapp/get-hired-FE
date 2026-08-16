import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService, RecruiterThreadSummary } from '@app-shared/services/message.service';

type InboxFilter = 'all' | 'needs-reply';

/**
 * B01 — Global recruiter messages inbox at /recruiter/messages.
 *
 * Gives recruiters one place to see all company-scoped candidate conversations
 * and reply without losing job/application context. Uses the existing
 * message.service.ts and app-message-thread shared component — no duplicate
 * messaging infrastructure is created.
 *
 * Design decisions:
 * - No is_read column in the schema → "Unread" filter is NOT shown.
 *   A backlog item tracks adding read-state in a future schema migration.
 * - needsReply is the only real actionability signal (lastSenderRole=applicant).
 * - Thread detail is rendered inline (two-pane desktop, list-first mobile)
 *   using the existing app-message-thread component, which handles
 *   polling, send, and error states itself.
 * - Applicant name is joined from the users table in listRecruiterThreads()
 *   (B01 BACKLOG-02). Falls back to "Candidate <uid-suffix>" when null.
 */
@Component({
  selector: 'app-recruiter-messages',
  templateUrl: './recruiter-messages.component.html',
  styleUrls: ['./recruiter-messages.component.scss'],
})
export class RecruiterMessagesComponent implements OnInit, OnDestroy {
  threads: RecruiterThreadSummary[] = [];
  filteredThreads: RecruiterThreadSummary[] = [];
  selectedThread: RecruiterThreadSummary | null = null;

  loading = true;
  error = false;
  retrying = false;

  activeFilter: InboxFilter = 'all';
  showDetail = false; // mobile: true = show thread detail instead of list

  private destroy$ = new Subject<void>();

  constructor(
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Phase 1.5A -- Capability C deep-link from Interview Detail's "Message
    // Applicant" CTA: ?jobId=&applicantUid=. Falls back to the plain inbox
    // load when absent, or if resolving the deep link fails for any reason.
    const jobId = this.route.snapshot.queryParamMap.get('jobId');
    const applicantUid = this.route.snapshot.queryParamMap.get('applicantUid') || undefined;
    if (jobId) {
      this.openDeepLinkedThread(jobId, applicantUid);
    } else {
      this.loadThreads();
    }
  }

  /** Opens (or reuses) the thread for a (jobId, applicantUid) pair via the
   * existing idempotent MessageService.openThread(), then loads the inbox
   * and auto-selects the matching thread -- never creates a duplicate. */
  private openDeepLinkedThread(jobId: string, applicantUid?: string): void {
    this.loading = true;
    this.error = false;
    this.messageService
      .openThread(jobId, applicantUid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (thread) => {
          this.messageService
            .getRecruiterThreads()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (threads) => {
                this.threads = threads ?? [];
                this.applyFilter();
                this.loading = false;
                const match = this.threads.find((t) => t.threadId === thread?.id);
                if (match) { this.selectThread(match); }
              },
              error: () => {
                this.loading = false;
                this.error = true;
              },
            });
        },
        error: () => {
          // Couldn't resolve/open the specific thread (e.g. cross-company
          // access denied) -- degrade to the normal inbox rather than a
          // hard failure.
          this.loadThreads();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadThreads(): void {
    this.loading = true;
    this.error = false;
    this.messageService
      .getRecruiterThreads()
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
    // If the selected thread was filtered out, deselect it.
    if (
      this.selectedThread &&
      !this.filteredThreads.find((t) => t.threadId === this.selectedThread!.threadId)
    ) {
      this.selectedThread = null;
      this.showDetail = false;
    }
  }

  selectThread(thread: RecruiterThreadSummary): void {
    this.selectedThread = thread;
    this.showDetail = true; // mobile: switch to detail view
  }

  backToList(): void {
    this.showDetail = false;
    // Don't clear selectedThread — desktop keeps it highlighted
  }

  /** Accessible label for each thread row in the list. */
  threadLabel(t: RecruiterThreadSummary): string {
    const job = t.jobTitle ? `for ${t.jobTitle}` : '';
    const when = t.lastMessageAt ? `, last message ${new Date(t.lastMessageAt).toLocaleString()}` : '';
    return `Conversation ${job}${when}${t.needsReply ? ', needs your reply' : ''}`;
  }

  applicantLabel(t: RecruiterThreadSummary): string {
    if (t.applicantName) return t.applicantName;
    if (!t.applicantUid) return 'Candidate';
    return 'Candidate ' + t.applicantUid.slice(-6).toUpperCase();
  }

  avatarInitial(t: RecruiterThreadSummary): string {
    if (t.applicantName) return t.applicantName.charAt(0).toUpperCase();
    return 'C';
  }

  /** Snippet with safe truncation for display. */
  snippet(t: RecruiterThreadSummary): string {
    if (!t.lastMessageSnippet) return 'No messages yet.';
    return t.lastMessageSnippet.length > 80
      ? t.lastMessageSnippet.slice(0, 80) + '…'
      : t.lastMessageSnippet;
  }

  goToApplicants(): void {
    this.router.navigate(['/recruiter/contacts']);
  }

  goToJobs(): void {
    this.router.navigate(['/recruiter/jobs/list']);
  }

  goToDashboard(): void {
    this.router.navigate(['/recruiter/dashboard']);
  }

  trackByThreadId(_i: number, t: RecruiterThreadSummary): string {
    return t.threadId;
  }
}
