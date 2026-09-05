import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroupDirective, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { VideoPreviewComponent } from '@app-shared/components/video-preview/video-preview.component';
import { FileViewerComponent } from '@app-shared/components/file-viewer/file-viewer.component';
import * as InterviewModel from '@main/interview/interview.model';

@Component({
  selector: 'app-application-preview',
  animations: [mainAnimations],
  templateUrl: './application-preview.component.html',
  styleUrls: ['./application-preview.component.scss']
})
export class ApplicationPreviewComponent implements OnInit {
  @Input() profile: any;
  @Input() interviews: InterviewModel.InterviewQuestion[];
  @Input() docs: any;
  @Input() applicantAnswers: any;
  /** GH-EMP-B01 -- optional, employer-view-only. The applicant's own
   * application-flow usage of this shared component never passes this,
   * so the template's *ngIf keeps that path completely unaffected. */
  @Input() matchSignals: any;
  /** Employer-view-only, optional: opens the first answer straight into the
   * review modal on load -- used when arriving here via a "Review responses"
   * deep link (recruiter-interview-hub) so the recruiter lands directly on
   * the video instead of having to click a row themselves. */
  @Input() autoOpenFirstAnswer: boolean = false;

  // BUGFIX (production): Step 4's Interview Answers section used to render
  // the full per-question video list -- redundant with Step 3, and every
  // row was clickable to preview, which read as broken when the applicant
  // was just trying to review their submission, not re-watch each answer.
  // Now shows a count + "Go Back to Step 3" button in the applicant's own
  // apply-flow context only (see isApplicantOwnFlow below); emits this so
  // the parent can navigate back WITHOUT re-opening the "Recruiter would
  // like to ask you some questions" dialog (that dialog is only for
  // arriving at Step 3 forward, from Step 1/2 -- see
  // application-process.component.ts's goBackToStep3()).
  @Output() goBackToInterview = new EventEmitter<void>();

  govFiles = [];
  resume = [];
  coverLetter = [];
  answers = [];

  public profileSummary: boolean = true;

  constructor(
    private rootFormGroup: FormGroupDirective,
    private dialog: MatDialog
  ) { }

  get docGovFile() {
    return this.rootFormGroup.control.get(['profileDocs', 'governmentFiles']) as FormArray;
  }

  get docResume() {
    return this.rootFormGroup.control.get(['profileDocs', 'resume']) as FormArray;
  }

  get docCover() {
    return this.rootFormGroup.control.get(['profileDocs', 'coverLetter']) as FormArray;
  }

  get answersArray() {
    return this.rootFormGroup.control.get('interviewAnswers') as FormArray;
  }

  // True only for the applicant's own live apply-flow usage of this
  // component (application-process.component.html, inside a real
  // [formGroup]) -- false for every read-only employer view (job
  // applicants list, candidate list), which pass applicantAnswers/docs
  // directly instead. See ngOnInit's existing branch on this same check.
  get isApplicantOwnFlow(): boolean {
    return !!this.rootFormGroup.control;
  }

  ngOnInit(): void {
    if (this.rootFormGroup.control) {
      this.govFiles = this.docGovFile.value;
      this.resume = this.docResume.value;
      this.coverLetter = this.docCover.value;
      this.answers = this.answersArray.value;
    } else {
      this.govFiles = this.docs.governmentFiles;
      this.resume = this.docs.resume;
      this.coverLetter = this.docs.coverLetter;

      this.answers = this.applicantAnswers.map(answer => {
        return {
          ...answer,
          index: this.interviews.findIndex(intv => intv.questionId === answer.questionId)
        }
      })

      if (this.autoOpenFirstAnswer && this.reviewItems.length) {
        // Dialog service needs the host view fully initialized first.
        setTimeout(() => this.openAnswersReview(0));
      }
    }

  }

  viewMore() {
    this.profileSummary = !this.profileSummary
  }

  // BUGFIX (defensive): an answer whose questionId no longer matches any
  // question in `interviews` (question deleted/edited after the applicant
  // answered) previously produced index: -1, and the template's
  // `interviews[item.index].question` would throw on `interviews[-1]`
  // being undefined -- silently breaking the whole answers list. Filtered
  // out here instead, and this is now the SINGLE source both the template
  // and openAnswersReview() read from, so their indexes always agree.
  get reviewItems(): { question: string; url: string; createdAt?: string }[] {
    if (!this.answers || !this.answers.length) return [];
    return this.answers
      .filter(a => a && this.interviews && this.interviews[a.index])
      .map(a => ({
        question: this.interviews[a.index].question,
        url: a.answerBlob || a.answerUrl,
        createdAt: a.createdAt,
      }));
  }

  // PROFESSIONAL REVIEW UPGRADE: previously each row opened its own,
  // single-video dialog -- reviewing all of an applicant's answers meant
  // closing and reopening the modal per question. Now every row opens the
  // SAME dialog with the applicant's full answer set, starting at the
  // clicked question, so a recruiter can step through with Next/Previous
  // (or the question strip) without leaving the modal.
  openAnswersReview(startIndex: number): void {
    const items = this.reviewItems;
    if (!items.length) return;

    this.dialog.open(VideoPreviewComponent, {
      width: '92vw',
      maxWidth: '960px',
      panelClass: 'video-preview-panel',
      data: {
        items,
        startIndex,
      }
    });
  }

  // BUGFIX: this Resume/Cover Letter/Government Files section previously
  // had no click handler at all -- every row was static text, so a
  // recruiter viewing a candidate's application had no way to actually
  // open or download any of these documents (only the separate, lower
  // "DOCUMENTS" section further down the page, rendered by
  // app-applicant-details, was interactive). Reuses the same
  // FileViewerComponent/blob-download pattern already used there.
  viewDoc(item: any): void {
    if (!item?.fileurl) return;
    this.dialog.open(FileViewerComponent, {
      width: '60vw',
      height: '80vh',
      data: item
    });
  }

  downloadDoc(item: any): void {
    if (!item?.fileurl) return;
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        const blobUrl = window.URL.createObjectURL(xmlHttp.response);
        const e = document.createElement('a');
        e.href = blobUrl;
        e.download = item.filename;
        document.body.appendChild(e);
        e.click();
        document.body.removeChild(e);
        window.URL.revokeObjectURL(blobUrl);
      }
    };
    xmlHttp.responseType = 'blob';
    xmlHttp.open('GET', item.fileurl, true);
    xmlHttp.send(null);
  }
}
