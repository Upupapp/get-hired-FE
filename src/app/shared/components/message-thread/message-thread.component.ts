import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatMessage, MessageService } from '@app-shared/services/message.service';
import { Subject, interval, switchMap, takeUntil, catchError, of } from 'rxjs';

/**
 * Reusable chat panel for a single (job, applicant) conversation thread.
 * Frontend for GH-EMP-B04's messaging backend -- see message.service.ts
 * header comment. Used on both the employer side (job-applicants detail
 * view, applicantUid supplied) and the applicant side (My Applications,
 * applicantUid omitted -- backend always resolves "yourself" for a caller
 * not recognized as the owning employer).
 *
 * Polls for new messages every 8s while open rather than a websocket --
 * no realtime infrastructure exists anywhere in this app yet, and a
 * lightweight poll is consistent in scope with the rest of this pass.
 *
 * Uses ngOnChanges (not ngOnInit) to open the thread, so this component
 * stays correct even if a future caller keeps one instance alive across
 * different (jobId, applicantUid) pairs instead of destroying/recreating
 * it -- found during a post-deploy SWEEP pass tracing the actual current
 * call sites (currently safe by coincidence of how *ngIf is structured
 * in both callers, not by the component's own design; this closes that gap).
 */
@Component({
  selector: 'app-message-thread',
  templateUrl: './message-thread.component.html',
  styleUrls: ['./message-thread.component.scss'],
})
export class MessageThreadComponent implements OnChanges, OnDestroy, AfterViewChecked {
  @Input() jobId!: string;
  @Input() applicantUid?: string;
  @Input() otherPartyLabel = 'this conversation';
  @Input() currentUserRole: 'employer' | 'applicant' = 'applicant';

  @ViewChild('scrollAnchor') private scrollAnchor!: ElementRef<HTMLDivElement>;

  threadId: string | null = null;
  messages: ChatMessage[] = [];
  loading = true;
  sending = false;
  error: string | null = null;
  newBody = '';

  private destroy$ = new Subject<void>();
  private pollDestroy$ = new Subject<void>();
  private shouldScroll = false;

  constructor(private messageService: MessageService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.jobId) return;
    if (!changes['jobId'] && !changes['applicantUid']) return;
    this.resetForNewThread();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.scrollAnchor) {
      this.scrollAnchor.nativeElement.scrollIntoView({ block: 'end' });
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetForNewThread(): void {
    // Stop any poll from the previous (jobId, applicantUid) pair before
    // starting a new one -- without this, switching conversations on a
    // reused instance would leave two pollers running against two threads.
    this.pollDestroy$.next();
    this.threadId = null;
    this.messages = [];
    this.loading = true;
    this.error = null;
    this.newBody = '';

    this.messageService.openThread(this.jobId, this.applicantUid).subscribe({
      next: (thread) => {
        this.threadId = thread?.id ?? null;
        if (this.threadId) {
          this.loadMessages();
          this.startPolling();
        } else {
          this.loading = false;
          this.error = 'Could not open this conversation.';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Could not open this conversation. Please try again.';
      },
    });
  }

  private loadMessages(): void {
    if (!this.threadId) return;
    this.messageService.getThreadMessages(this.threadId).subscribe({
      next: (msgs) => {
        const grew = msgs.length > this.messages.length;
        this.messages = msgs;
        this.loading = false;
        if (grew) this.shouldScroll = true;
      },
      error: () => {
        this.loading = false;
        // Never blow away an already-loaded conversation on a transient
        // poll failure -- only show the error state on the first load.
        if (this.messages.length === 0) {
          this.error = 'Could not load messages.';
        }
      },
    });
  }

  private startPolling(): void {
    const threadIdAtStart = this.threadId;
    interval(8000)
      .pipe(
        takeUntil(this.destroy$),
        takeUntil(this.pollDestroy$),
        switchMap(() => this.messageService.getThreadMessages(threadIdAtStart as string)),
        catchError(() => of(null)),
      )
      .subscribe((msgs) => {
        if (!msgs) return;
        const grew = msgs.length > this.messages.length;
        this.messages = msgs;
        if (grew) this.shouldScroll = true;
      });
  }

  send(): void {
    const body = this.newBody.trim();
    if (!body || !this.threadId || this.sending) return;
    this.sending = true;
    this.messageService.sendMessage(this.threadId, body).subscribe({
      next: (msg) => {
        this.messages = [...this.messages, msg];
        this.newBody = '';
        this.sending = false;
        this.shouldScroll = true;
      },
      error: () => {
        this.sending = false;
        this.error = 'Could not send your message. Please try again.';
      },
    });
  }

  isOwnMessage(msg: ChatMessage): boolean {
    return msg.sender_role === this.currentUserRole;
  }

  /** Without this, *ngFor re-renders every bubble on every 8s poll tick
   * even when nothing changed, since `messages` gets a new array
   * reference each time -- found during an OPTIMIZE pass. */
  trackByMessageId(_index: number, msg: ChatMessage): string {
    return msg.id;
  }
}
