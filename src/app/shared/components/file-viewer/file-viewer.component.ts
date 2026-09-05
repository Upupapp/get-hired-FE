import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
const OFFICE_EXTENSIONS = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];

@Component({
  selector: 'app-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent implements OnInit {

  // BUGFIX: this modal previously only ever rendered a raw iframe pointed
  // at data.fileurl -- fine for a PDF (the browser's native PDF viewer
  // takes over), but for anything else (.docx, images, unknown types) the
  // iframe would just try to load/download the raw bytes, showing a blank
  // or broken frame with no explanation and no way to actually get the
  // file. Callers worked around this by never opening the modal for
  // non-PDF files at all -- calling downloadFile() directly instead, so
  // "preview" and "download" were mutually exclusive rather than both
  // being available. This component now picks a render mode per file type
  // (PDF iframe / Office Online embed for docx & friends / <img> for
  // images / a plain "preview not available" message otherwise) and always
  // shows a working Download button underneath, so download is available
  // regardless of whether a preview could be shown.
  sanitize: any;
  previewMode: 'pdf' | 'office' | 'image' | 'unsupported' = 'unsupported';
  filename: string;

  constructor(
    public dialogRef: MatDialogRef<FileViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.filename = this.data?.filename || '';
    // Uploaded filenames in this app carry a timestamp suffix appended
    // directly after the real extension (e.g. "CV.docx-1788176327242"),
    // not after the base name -- a plain `.split('.').pop()` would read
    // "docx-1788176327242" as the extension and never match anything.
    // Matches the real extension anywhere in the name instead.
    const extMatch = this.filename.toLowerCase().match(
      /\.(pdf|docx?|xlsx?|pptx?|jpe?g|png|gif|webp|bmp|svg)(?:[^a-z0-9]|$)/
    );
    const ext = extMatch ? extMatch[1] : '';
    const fileurl = this.data?.fileurl;

    if (ext === 'pdf') {
      this.previewMode = 'pdf';
      this.sanitize = this.sanitizer.bypassSecurityTrustResourceUrl(fileurl);
    } else if (OFFICE_EXTENSIONS.includes(ext)) {
      this.previewMode = 'office';
      this.sanitize = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileurl)}`
      );
    } else if (IMAGE_EXTENSIONS.includes(ext)) {
      this.previewMode = 'image';
      this.sanitize = this.sanitizer.bypassSecurityTrustResourceUrl(fileurl);
    } else {
      this.previewMode = 'unsupported';
    }
  }

  downloadFile(): void {
    const file = this.data;
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        const blobUrl = window.URL.createObjectURL(xmlHttp.response);
        const e = document.createElement('a');
        e.href = blobUrl;
        e.download = file.filename;
        document.body.appendChild(e);
        e.click();
        document.body.removeChild(e);
        window.URL.revokeObjectURL(blobUrl);
      }
    };
    xmlHttp.responseType = 'blob';
    xmlHttp.open('GET', file.fileurl, true);
    xmlHttp.send(null);
  }

}
