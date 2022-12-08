import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { FileViewerComponent } from '@app-shared/components/file-viewer/file-viewer.component';
import * as Model from '@main/applicant/applicant.model';

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
  ) { }

  ngOnInit(): void {
  }

  viewDocs(file) {
    if(this.checkFileType(file.filename).toLowerCase() == 'pdf'){
      let dialog = this.dialog.open(FileViewerComponent, {
        width: '50vw',
        height: '40vw',
        data: file
      });
    } else {
      this.downloadFile(file);
    }
  }

  downloadFile(file){
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
      }
    };
    xmlHttp.responseType = 'blob';
    xmlHttp.open('GET', file.fileurl, true);
    xmlHttp.send(null);
  }

  checkFileType(file): string {
    return file.split('.').pop();
  }
}
