import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { FileViewerComponent } from '@app-shared/components/file-viewer/file-viewer.component';
import * as Model from '@main/applicant/applicant.model';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-applicant-avatar',
  animations: [mainAnimations],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {
  @Input() user: Model.Applicant;

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
  }

  // BUGFIX: previously force-downloaded anything that wasn't a PDF instead
  // of previewing it. FileViewerComponent now handles docx (Office Online
  // embed), images, and unsupported types gracefully and always has its
  // own working Download button, so every file type opens the same modal.
  viewDocs(file) {
    this.dialog.open(FileViewerComponent, {
      width: '60vw',
      height: '80vh',
      data: file
    });
  }

  // BUGFIX: the previous XHR-blob fetch straight to Firebase Storage was
  // blocked by CORS -- this Download button silently did nothing. Routes
  // through the same backend proxy (GET /files/download) already fixed
  // and deployed for the candidate-documents Download button.
  downloadFile(file){
    if (!file?.fileurl) return;
    const filename = file.filename || 'document';
    const proxyUrl = `${environment.api_url}/files/download?url=${encodeURIComponent(file.fileurl)}&filename=${encodeURIComponent(filename)}`;
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: token } : {};
    this.http.get(proxyUrl, { responseType: 'blob', headers }).subscribe({
      next: (blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const e = document.createElement('a');
        e.href = blobUrl;
        e.download = filename;
        document.body.appendChild(e);
        e.click();
        document.body.removeChild(e);
        window.URL.revokeObjectURL(blobUrl);
      },
      error: () => {
        window.open(file.fileurl, '_blank', 'noopener');
      },
    });
  }
}
