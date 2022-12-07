import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent implements OnInit {

  sanitize: any;

  constructor(
    public dialogRef: MatDialogRef<FileViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.sanitize = this.sanitizer.bypassSecurityTrustUrl(this.data.fileUrl);
  }

}
