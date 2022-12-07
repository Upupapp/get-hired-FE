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

  viewDocs(url) {
    let dialog = this.dialog.open(FileViewerComponent, {
      width: '70vw',
      data: {
        fileUrl: url
      }
    });
  }
}
