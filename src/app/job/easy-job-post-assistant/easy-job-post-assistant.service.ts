import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { AssistantExtractionResult, AssistantUploadResponse, AssistantLinkResponse, GenerateIntentInputs, GenerateIntentResponse, InstantJobDraft } from './easy-job-post-assistant.models';

@Injectable({ providedIn: 'root' })
export class EasyJobPostAssistantService {
  private apiBase = environment.api_url;
  private _extractionResult: AssistantExtractionResult | null = null;
  private _generatedDraft: InstantJobDraft | null = null;

  constructor(private http: HttpClient) {}

  uploadAndExtract(file: File): Observable<AssistantUploadResponse> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<AssistantUploadResponse>(
      `${this.apiBase}/recruiter/job-post-assistant/upload`,
      form
    );
  }

  linkAndExtract(url: string): Observable<AssistantLinkResponse> {
    return this.http.post<AssistantLinkResponse>(
      `${this.apiBase}/recruiter/job-post-assistant/link`,
      { url }
    );
  }

  setExtractionResult(result: AssistantExtractionResult): void {
    this._extractionResult = result;
  }

  getExtractionResult(): AssistantExtractionResult | null {
    return this._extractionResult;
  }

  clearExtractionResult(): void {
    this._extractionResult = null;
  }

  hasExtractionResult(): boolean {
    return this._extractionResult !== null;
  }

  // ── V4 Generate Intent ─────────────────────────────────────────────────────

  generateFromInputs(inputs: GenerateIntentInputs): Observable<GenerateIntentResponse> {
    return this.http.post<GenerateIntentResponse>(
      `${this.apiBase}/recruiter/job-post-assistant/generate-intent`,
      inputs
    );
  }

  setGeneratedDraft(draft: InstantJobDraft): void {
    this._generatedDraft = draft;
  }

  getGeneratedDraft(): InstantJobDraft | null {
    return this._generatedDraft;
  }

  clearGeneratedDraft(): void {
    this._generatedDraft = null;
  }

  hasGeneratedDraft(): boolean {
    return this._generatedDraft !== null;
  }
}
