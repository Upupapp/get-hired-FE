import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Router } from '@angular/router';
import * as Model from '@main/applicant/applicant.model';
import { month } from '@app-shared/mock.data';
import { CoreService } from '@app-core/services/core.service';
import { CvBuilderService } from '@app-applicant/cv-builder/cv-builder.service';
import { FileViewerComponent } from '@app-shared/components/file-viewer/file-viewer.component';

interface CurrentCv {
  id: string;
  filename: string;
  fileurl: string;
  size?: number;
  type?: string;
  created_at: string;
}

@Component({
  selector: 'app-applicant-details',
  animations: [mainAnimations],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  @Input() user: Model.Applicant;
  @Input() isApplicantView: boolean;
  // APP-010 / EMP-021 fix: when a caller already has an authorized,
  // correctly-scoped CV/document object for the profile being displayed
  // (e.g. application-preview.component's `docs` input, sourced from the
  // job/application-ownership-checked getJobApplicantDetails endpoint),
  // pass it here instead of letting this component fetch its own. The
  // component's own fetch (below) always calls GET /cv-builder/current,
  // which is scoped to whoever is CURRENTLY LOGGED IN -- correct only when
  // this component is genuinely showing that same person's own profile
  // (applicant-profile-details.component's usage). When an employer views
  // a candidate through application-preview, that self-scoped call
  // resolved against the EMPLOYER's identity instead, so a candidate's
  // real CV never appeared here even though it existed and was already
  // being shown correctly, separately, further down the same page.
  // undefined = not provided by caller -> fall back to self-scoped fetch.
  // null/object = caller already resolved it (even if null = genuinely none).
  @Input() cvOverride: CurrentCv | null | undefined = undefined;

  months = month;
  userRole: string;

  // DOCUMENTS SECTION: user.documents (from the applicant profile GET)
  // already excludes the dedicated CV (is_cv=true row) by design -- see
  // applicantsController.js's saveDocuments and cvBuilderController.js's
  // getCurrentCv(), "CV Builder stays the single source of truth for the
  // current CV". This preview previously showed neither the CV nor the
  // other documents at all, so a real "Documents" section needs both
  // fetched (CV separately, via the same /cv-builder/current endpoint the
  // CV Builder page and Profile Documents step already use) and combined
  // for display.
  currentCv: CurrentCv | null = null;
  loadingCurrentCv = true;

  constructor(
    public router: Router,
    private coreService: CoreService,
    private cvBuilderService: CvBuilderService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.coreService.getRole()
      .then(role => this.userRole = role);

    if (this.cvOverride !== undefined) {
      // Caller already resolved the correct, authorized CV for the
      // profile being shown (or confirmed there isn't one) -- never call
      // the self-scoped endpoint in this mode.
      this.currentCv = this.cvOverride;
      this.loadingCurrentCv = false;
      return;
    }

    this.cvBuilderService.getCurrentCv().subscribe({
      next: (res: any) => {
        this.currentCv = res?.data || null;
        this.loadingCurrentCv = false;
      },
      error: () => {
        this.currentCv = null;
        this.loadingCurrentCv = false;
      },
    });
  }

  get hasAnyDocuments(): boolean {
    return !!this.currentCv || !!(this.user?.documents && this.user.documents.length > 0);
  }

  navigateToEdit(){
    sessionStorage.setItem('profile-update', '3');
    this.router.navigate(['/user/profile/edit'])
  }

  // Mirrors avatar.component.ts's own viewDocs()/downloadFile() exactly,
  // so "My Profile"'s two document surfaces (the identity header's compact
  // list and this new dedicated section) behave identically.
  // BUGFIX: previously fell straight to downloadFile() for anything that
  // wasn't a PDF, so a docx CV (a very common case) could never be
  // previewed at all -- only force-downloaded. FileViewerComponent now
  // handles docx (Office Online embed), images, and unsupported types
  // gracefully, and always offers its own working Download button, so
  // every file type opens the same modal -- preview and download are both
  // available, not one instead of the other.
  viewDocs(file: any) {
    this.dialog.open(FileViewerComponent, {
      width: '60vw',
      height: '80vh',
      data: file
    });
  }

  downloadFile(file: any) {
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

}
