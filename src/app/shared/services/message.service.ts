import { Injectable } from '@angular/core';
import { BaseService } from '@main/core/services/base.service';
import { environment } from 'environments/environment';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface MessageThread {
  id: string;
  job_id: string;
  company_id: string;
  applicant_uid: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_uid: string;
  sender_role: 'employer' | 'applicant';
  body: string;
  created_at: string;
}

/**
 * B01 — Global recruiter inbox thread summary shape returned by
 * GET /api/messages/recruiter/threads. No is_read column exists in the
 * schema so unreadCount is omitted. needsReply is derived server-side
 * from lastSenderRole === 'applicant'.
 */
export interface RecruiterThreadSummary {
  threadId: string;
  applicantUid: string;
  applicantName: string | null;
  applicantPhotoUrl: string | null;
  jobId: string;
  jobTitle: string | null;
  lastMessageSnippet: string | null;
  lastSenderRole: 'employer' | 'applicant' | null;
  lastMessageAt: string;
  needsReply: boolean;
  /** Real per-thread unread count -- messages sent by the applicant since
   * the employer side last read this thread (message_threads.employer_last_read_at). */
  unreadCount: number;
}

/**
 * Jobseeker Messages tab -- applicant-side equivalent of
 * RecruiterThreadSummary, returned by GET /api/messages/applicant/threads.
 */
export interface ApplicantThreadSummary {
  threadId: string;
  jobId: string;
  companyId: string;
  jobTitle: string | null;
  companyName: string | null;
  companyLogoUrl: string | null;
  lastMessageSnippet: string | null;
  lastSenderRole: 'employer' | 'applicant' | null;
  lastMessageAt: string;
  needsReply: boolean;
  /** Real per-thread unread count -- messages sent by the employer since
   * the applicant last read this thread (message_threads.applicant_last_read_at). */
  unreadCount: number;
}

/**
 * Frontend for GH-EMP-B04's messaging backend (controllers/messageController.js,
 * services/message.service.js) -- the backend has existed since that pass,
 * but had zero frontend consumers until now (confirmed via grep; see the
 * GH1 checkpoint memory). Role/ownership is never sent from here -- the
 * backend always derives it server-side from the authenticated uid.
 *
 * B01 addition: getRecruiterThreads() calls the new
 * GET /api/messages/recruiter/threads endpoint for the global inbox.
 */
@Injectable({ providedIn: 'root' })
export class MessageService {
  private base = `${environment.api_url}/messages`;

  // Fires whenever this service knows the caller's unread state just
  // changed (a thread was marked read, or a message was just sent -- see
  // markThreadRead()/sendMessage() below) -- both sidebars subscribe to
  // this alongside their own poll interval so the badge updates the
  // instant the applicant/employer actually reads or sends a message,
  // instead of waiting out the next poll tick. Still no real push
  // infrastructure (no websocket exists in this codebase); this only
  // shortcuts the delay for actions that happen inside the SAME browser
  // tab, which is the common case this was reported against.
  unreadCountChanged$ = new Subject<void>();

  constructor(private baseService: BaseService) {}

  /** Opens (or creates) the thread for a (jobId, applicantUid) pair.
   * applicantUid is ignored server-side when the caller isn't recognized
   * as the owning employer -- always resolves to "yourself" for applicants. */
  openThread(jobId: string, applicantUid?: string): Observable<MessageThread> {
    return this.baseService
      .post<any>(`${this.base}/thread`, { jobId, applicantUid })
      .pipe(map((res: any) => res?.data));
  }

  getThreadMessages(threadId: string): Observable<ChatMessage[]> {
    return this.baseService
      .get<any>(`${this.base}/thread/messages?threadId=${encodeURIComponent(threadId)}`)
      .pipe(map((res: any) => res?.data ?? []));
  }

  sendMessage(threadId: string, body: string): Observable<ChatMessage> {
    return this.baseService
      .post<any>(`${this.base}/thread/send`, { threadId, body })
      .pipe(map((res: any) => res?.data));
  }

  /** B01 — Returns all thread summaries for the authenticated recruiter's company.
   * Company scoping is enforced server-side; applicants and guests receive 403. */
  getRecruiterThreads(): Observable<RecruiterThreadSummary[]> {
    return this.baseService
      .get<any>(`${this.base}/recruiter/threads`)
      .pipe(map((res: any) => res?.data ?? []));
  }

  /** Jobseeker Messages tab -- returns all thread summaries where the
   * authenticated caller is the applicant. Scoping is enforced server-side
   * (message.service.listApplicantThreads); a caller can only ever see
   * their own threads. */
  getApplicantThreads(): Observable<ApplicantThreadSummary[]> {
    return this.baseService
      .get<any>(`${this.base}/applicant/threads`)
      .pipe(map((res: any) => res?.data ?? []));
  }

  /** Marks the caller's own side of a thread as read (up to now).
   * Call this when the user actually opens/views a thread's messages. */
  markThreadRead(threadId: string): Observable<any> {
    return this.baseService
      .post<any>(`${this.base}/thread/${encodeURIComponent(threadId)}/read`, {})
      .pipe(
        map((res: any) => res?.data),
        tap(() => this.unreadCountChanged$.next()),
      );
  }

  /** Total unread message count across all of the caller's threads --
   * backs the sidebar Messages badge. */
  getUnreadCount(): Observable<number> {
    return this.baseService
      .get<any>(`${this.base}/unread-count`)
      .pipe(map((res: any) => res?.data?.unreadCount ?? 0));
  }
}