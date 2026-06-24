import { Injectable } from '@angular/core';
import { BaseService } from '@main/core/services/base.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  jobId: string;
  jobTitle: string | null;
  lastMessageSnippet: string | null;
  lastSenderRole: 'employer' | 'applicant' | null;
  lastMessageAt: string;
  needsReply: boolean;
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
}