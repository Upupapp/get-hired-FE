import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  CancelInterviewRequest,
  CancelInterviewSuccess,
  CreateScheduledInterviewRequest,
  InterviewListFilter,
  RescheduleInterviewRequest,
  RescheduleInterviewSuccess,
  ScheduleInterviewSuccess,
  ScheduledInterview,
  ScheduledInterviewListResponse,
} from './interview-scheduling.models';

interface ApiEnvelope<T> {
  status: string;
  data: T;
}

/**
 * Internal Interview Scheduling MVP -- employer-facing HTTP client.
 * Wraps the already-implemented and verified `/interview/scheduled*` backend
 * routes. Auth (Firebase token) is attached automatically by the existing
 * global AuthInterceptor -- no auth handling needed here, matching the same
 * pattern already used by RecruiterInterviewHubService.
 */
@Injectable({ providedIn: 'root' })
export class InterviewSchedulingService {
  private readonly baseUrl = `${environment.api_url}/interview/scheduled`;

  constructor(private http: HttpClient) {}

  create(payload: CreateScheduledInterviewRequest): Observable<ScheduleInterviewSuccess> {
    return this.http
      .post<ApiEnvelope<ScheduleInterviewSuccess>>(this.baseUrl, payload)
      .pipe(map((res) => res.data));
  }

  list(filter?: InterviewListFilter): Observable<ScheduledInterviewListResponse> {
    let params = new HttpParams();
    if (filter) {
      params = params.set('filter', filter);
    }
    return this.http
      .get<ApiEnvelope<ScheduledInterviewListResponse>>(this.baseUrl, { params })
      .pipe(map((res) => res.data));
  }

  getById(interviewId: string): Observable<ScheduledInterview> {
    return this.http
      .get<ApiEnvelope<ScheduledInterview>>(`${this.baseUrl}/${encodeURIComponent(interviewId)}`)
      .pipe(map((res) => res.data));
  }

  reschedule(interviewId: string, payload: RescheduleInterviewRequest): Observable<RescheduleInterviewSuccess> {
    return this.http
      .patch<ApiEnvelope<RescheduleInterviewSuccess>>(
        `${this.baseUrl}/${encodeURIComponent(interviewId)}/reschedule`,
        payload
      )
      .pipe(map((res) => res.data));
  }

  cancel(interviewId: string, payload: CancelInterviewRequest = {}): Observable<CancelInterviewSuccess> {
    return this.http
      .post<ApiEnvelope<CancelInterviewSuccess>>(
        `${this.baseUrl}/${encodeURIComponent(interviewId)}/cancel`,
        payload
      )
      .pipe(map((res) => res.data));
  }
}
