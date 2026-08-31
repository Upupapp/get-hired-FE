import { Injectable } from '@angular/core';
import { BaseService } from '@main/core/services/base.service';
import { environment } from 'environments/environment';

/**
 * CVCOACH (v2 Product OS) -- frontend service for the new /cv-builder
 * backend route group. `upload()`/`getCurrent()` and the version endpoints
 * below all match real, working backend endpoints. CV Health, Surgical
 * Review, Match Explorer, and Action Plan remain unimplemented -- each
 * needs a document text-extraction + analysis engine that doesn't exist
 * anywhere in this codebase yet (a separate, larger backend effort, not
 * bundled into this phase) -- and this service does not pretend otherwise.
 */
@Injectable({ providedIn: 'root' })
export class CvBuilderService {
  private cvBuilderUrl = `${environment.api_url}/cv-builder`;

  constructor(private baseService: BaseService) {}

  uploadCv(fileDataUrl: string, filename?: string) {
    return this.baseService.post<any>(`${this.cvBuilderUrl}/upload`, { file: fileDataUrl, filename });
  }

  getCurrentCv() {
    return this.baseService.get<any>(`${this.cvBuilderUrl}/current`);
  }

  /** Real CV versioning (Phase B) -- every kept version, newest first. */
  getCvVersions() {
    return this.baseService.get<any>(`${this.cvBuilderUrl}/versions`);
  }

  /** Makes a prior version the active CV again. */
  activateCvVersion(id: string) {
    return this.baseService.post<any>(`${this.cvBuilderUrl}/versions/${encodeURIComponent(id)}/activate`, {});
  }

  /** Permanently deletes a kept-for-history version (never the active one -- backend refuses that). */
  deleteCvVersion(id: string) {
    return this.baseService.delete<any>(`${this.cvBuilderUrl}/versions/${encodeURIComponent(id)}`);
  }
}
