import { Injectable } from '@angular/core';
import { BaseService } from '@main/core/services/base.service';
import { environment } from 'environments/environment';

/**
 * CVCOACH (v2 Product OS) -- frontend service for the new /cv-builder
 * backend route group. `upload()` and `getCurrent()` match the two real
 * backend endpoints that exist (GET /cv-builder/current always existed
 * server-side but had no frontend caller until this fix -- the Overview
 * tab never showed an actually-uploaded CV as a result). The rest of the
 * architecture (analyze, match-explorer, action-plan, history, etc.) is
 * documented in GETHIRED_CVCOACH_ARCHITECTURE.md but not implemented yet,
 * since each of those needs the same missing schema this one endpoint
 * already works around honestly.
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
}
