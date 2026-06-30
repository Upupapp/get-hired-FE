import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface AnonPreviewRequest {
  jobTitle: string;
  location?: string;
  workSetup?: string;
  employmentType?: string;
  industry?: string;
}

export interface AnonPreviewPartial {
  title: string;
  snippet: string;
  skills: string[];
}

export interface AnonPreviewResponse {
  success: boolean;
  previewToken: string;
  partialPreview: AnonPreviewPartial;
  expiresInMinutes: number;
}

export interface ClaimPreviewResponse {
  success: boolean;
  jobId: string;
  message: string;
}

const PREVIEW_TOKEN_KEY = 'gh_ai_preview_token';

@Injectable({ providedIn: 'root' })
export class PublicJobPreviewService {
  private readonly apiBase = environment.api_url;

  constructor(private http: HttpClient) {}

  generatePreview(inputs: AnonPreviewRequest): Observable<AnonPreviewResponse> {
    return this.http.post<AnonPreviewResponse>(
      `${this.apiBase}/public/employer/ai-preview-generate`,
      inputs
    );
  }

  claimPreview(previewToken: string): Observable<ClaimPreviewResponse> {
    return this.http.post<ClaimPreviewResponse>(
      `${this.apiBase}/recruiter/job-post-assistant/claim-preview`,
      { previewToken }
    );
  }

  savePendingToken(token: string): void {
    try { sessionStorage.setItem(PREVIEW_TOKEN_KEY, token); } catch (_) {}
  }

  getPendingToken(): string | null {
    try { return sessionStorage.getItem(PREVIEW_TOKEN_KEY); } catch (_) { return null; }
  }

  clearPendingToken(): void {
    try { sessionStorage.removeItem(PREVIEW_TOKEN_KEY); } catch (_) {}
  }

  hasPendingToken(): boolean {
    return !!this.getPendingToken();
  }
}
