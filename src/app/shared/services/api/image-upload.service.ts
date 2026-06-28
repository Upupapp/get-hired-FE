import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private server = environment.api_url;

  constructor(private http: HttpClient) {}

  uploadImage(file: File, purpose: string): Observable<any> {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('purpose', purpose);
    return this.http.post<any>(`${this.server}/images/upload`, form);
  }
}
