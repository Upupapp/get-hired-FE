import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService, RecruiterThreadSummary, ChatMessage } from '@app-shared/services/message.service';

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

  /** Set from a ?jobId=/?applicantUid= deep link (e.g. "Message" on the
   *  Interviews hub) -- consumed once threads load, then cleared. */
  private pendingDeepLinkJobId: string | null = null;
  private pendingDeepLinkApplicantUid: string | null = null;
  private pendingDeepLinkState: { applicantName?: string | null; jobTitle?: string } = {};

  constructor(
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.pendingDeepLinkJobId = this.route.snapshot.queryParamMap.get('jobId');
    this.pendingDeepLinkApplicantUid = this.route.snapshot.queryParamMap.get('applicantUid');
    this.pendingDeepLinkState = (window.history.state as any) || {};
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
      .getRecruiterThreads()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (threads) => {
          this.threads = threads ?? [];
          this.applyFilter();
          this.loading = false;
          this.retrying = false;
          this.consumeDeepLink();
        },
        error: () => {
          this.loading = false;
          this.error = true;
          this.retrying = false;
        },
      });
  }

  /** Handles a ?jobId=&applicantUid= deep link (e.g. "Message" on the
   *  Interviews hub): selects the matching existing thread if one exists,
   *  or opens a brand-new one for that (job, applicant) pair if this is the
   *  first message to this candidate -- app-message-thread's own
   *  [jobId]/[applicantUid] inputs find-or-create the real thread
   *  server-side the moment the recruiter actually sends something. */
  private consumeDeepLink(): void {
    const jobId = this.pendingDeepLinkJobId;
    const applicantUid = this.pendingDeepLinkApplicantUid;
    this.pendingDeepLinkJobId = null;
    this.pendingDeepLinkApplicantUid = null;
    if (!jobId || !applicantUid) return;

    const existing = this.threads.find(
      (t) => t.jobId === jobId && t.applicantUid === applicantUid
    );
    if (existing) {
      this.selectThread(existing);
      return;
    }

    const state = this.pendingDeepLinkState;
    this.selectedThread = {
      threadId: '',
      applicantUid,
      applicantName: state.applicantName || null,
      applicantPhotoUrl: null,
      jobId,
      jobTitle: state.jobTitle || null,
      lastMessageSnippet: null,
      lastSenderRole: null,
      lastMessageAt: new Date().toISOString(),
      needsReply: false,
      unreadCount: 0,
    };
    this.showDetail = true;
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
    // Optimistic local clear -- app-message-thread marks the thread read
    // on the backend as soon as it opens; reflect that in the list
    // immediately instead of waiting for the next poll/reload.
    thread.unreadCount = 0;
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

  // APP-017 fix -- mirrors applicant-messages.component.ts's handlers; see
  // that file's comment for the root cause (message-thread previously had
  // no way to tell either inbox parent about a newly-opened/created thread
  // or a sent message).
  onThreadOpened(evt: { threadId: string; jobId: string; applicantUid?: string }): void {
    if (this.selectedThread && this.selectedThread.jobId === evt.jobId && this.selectedThread.applicantUid === evt.applicantUid) {
      this.selectedThread.threadId = evt.threadId;
    }
    const alreadyKnown = this.threads.some((t) => t.threadId === evt.threadId);
    if (alreadyKnown) return;

    const summary: RecruiterThreadSummary = this.selectedThread && this.selectedThread.jobId === evt.jobId && this.selectedThread.applicantUid === evt.applicantUid
      ? { ...this.selectedThread, threadId: evt.threadId }
      : {
          threadId: evt.threadId,
          applicantUid: evt.applicantUid || '',
          applicantName: null,
          applicantPhotoUrl: null,
          jobId: evt.jobId,
          jobTitle: null,
          lastMessageSnippet: null,
          lastSenderRole: null,
          lastMessageAt: new Date().toISOString(),
          needsReply: false,
          unreadCount: 0,
        };
    this.threads = [summary, ...this.threads];
    this.applyFilter();
  }

  onMessageSent(msg: ChatMessage): void {
    const idx = this.threads.findIndex((t) => t.threadId === msg.thread_id);
    if (idx === -1) return;
    const updated: RecruiterThreadSummary = {
      ...this.threads[idx],
      lastMessageSnippet: msg.body,
      lastSenderRole: msg.sender_role,
      lastMessageAt: msg.created_at,
      needsReply: false,
    };
    const rest = this.threads.filter((_, i) => i !== idx);
    this.threads = [updated, ...rest];
    this.applyFilter();
  }
}
