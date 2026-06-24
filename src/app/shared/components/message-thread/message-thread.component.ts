import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
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
 */
@Component({
  selector: 'app-message-thread',
  templateUrl: './message-thread.component.html',
  styleUrls: ['./message-thread.component.scss'],
})
export class MessageThreadComponent implements OnInit, OnDestroy, AfterViewChecked {
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
  private shouldScroll = false;

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
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
    interval(8000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.messageService.getThreadMessages(this.threadId as string)),
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
}
