import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface InterviewHubItem {
  applicationId: string;
  applicantId: string;
  applicantName: string | null;
  applicantEmail: string | null;
  applicantPhotoUrl: string | null;
  applicationStatusId: number;
  applicationStatus: string;
  dateApplied: string;
  lastActivity: string;
  jobId: string;
  jobTitle: string;
  videoAnswerCount: number;
  hasVideoAnswers: boolean;
}

export interface InterviewHubResponse {
  items: InterviewHubItem[];
  total: number;
}

/**
 * B03: RecruiterInterviewHub service.
 * Calls the company-scoped interview hub endpoint.
 * Authorization is enforced server-side via the JWT.
 * No caller-supplied IDs are ever passed in this service.
 */
@Injectable({ providedIn: 'root' })
export class RecruiterInterviewHubService {
  private readonly apiUrl = environment.api_url;

  constructor(private http: HttpClient) {}

  getInterviewHub(): Observable<InterviewHubResponse> {
    return this.http.get<InterviewHubResponse>(`${this.apiUrl}/interview/hub`);
  }
}
