import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicantFacade } from '@app-applicant/state/applicant.facade';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { LoadingComponent } from '@app-shared/components/loading/loading.component';
import * as Model from '../../applicant.model';

@Component({
  selector: 'app-docs-videocv',
  templateUrl: './docs-videocv.component.html',
  styleUrls: ['./docs-videocv.component.scss'],
  animations: [mainAnimations]
})
export class DocsVideocvComponent implements OnInit {
  @Input() user: any;
  @Input() applicantProfileId: string;

  docs: Model.Documents[] = [];
  tempDocs: Model.Documents[] = [];

  loading$ = this.applicantFacade.loading$
    .pipe().subscribe(this.formLoading.bind(this));

  success$ = this.applicantFacade.success$
    .pipe().subscribe(this.afterSubmit.bind(this))

  documents$ = this.applicantFacade.documents$
    .pipe().subscribe(this.fillUpArrays.bind(this));

  constructor(
    private dialog: MatDialog,
    private applicantFacade: ApplicantFacade,
    private snackBar: MatSnackBar,
    private loadingDialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  onUpload(docu: any) {

    const array = docu.map(item => {
      return {
        ...item,
        fileurl: item.fileurl || null,
        created_at: item.created_at || null
      }
    });

    this.tempDocs = [...array];
    console.log(this.tempDocs);
  }

  uploadDocs() {
    this.applicantFacade.saveDocs(this.docs, this.applicantProfileId);
  }

  fillUpArrays(data) {
    console.log(data);
    if (data) {
      this.docs = [...data]
    } else {
      this.docs = [];
    }

  }

  afterSubmit(event) {
    if (event == 'updated') {
      this.snackBar.open(`Profile successfully updated`, '', {
        duration: 4000,
        panelClass: ['success-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
    }
  }

  formLoading(loading: boolean) {
    if (loading) {
      const ref = this.loadingDialog.open(LoadingComponent, {
        disableClose: true,
        data: {
          selfClose: false
        }
      });
    } else {
      setTimeout(() => this.loadingDialog.closeAll(), 3000);
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.success$) {
      this.success$.unsubscribe();
    }

    if (this.documents$) {
      this.documents$.unsubscribe();
    }

    if(this.loading$) {
      this.loading$.unsubscribe();
    }
  }
}
