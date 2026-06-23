import { Injectable } from '@angular/core';
import { BaseService } from '@main/core/services/base.service';
import { environment } from 'environments/environment';

/**
 * CVCOACH (v2 Product OS) -- frontend service for the new /cv-builder
 * backend route group. Currently only `upload()` exists, matching the
 * one real backend endpoint built so far -- the rest of the architecture
 * (analyze, match-explorer, action-plan, history, etc.) is documented in
 * GETHIRED_CVCOACH_ARCHITECTURE.md but not implemented yet, since each of
 * those needs the same missing schema this one endpoint already works
 * around honestly.
 */
@Injectable({ providedIn: 'root' })
export class CvBuilderService {
  private cvBuilderUrl = `${environment.api_url}/cv-builder`;

  constructor(private baseService: BaseService) {}

  uploadCv(fileDataUrl: string, filename?: string) {
    return this.baseService.post<any>(`${this.cvBuilderUrl}/upload`, { file: fileDataUrl, filename });
  }
}
