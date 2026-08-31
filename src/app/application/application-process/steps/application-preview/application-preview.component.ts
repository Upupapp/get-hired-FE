import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroupDirective, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { VideoPreviewComponent } from '@app-shared/components/video-preview/video-preview.component';
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
    console.log(this.docs);

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
    }

  }

  viewMore() {
    this.profileSummary = !this.profileSummary
  }

  previewVideo(question, url) {

    let dialog = this.dialog.open(VideoPreviewComponent, {
      width: '92vw',
      maxWidth: '920px',
      panelClass: 'video-preview-panel',
      data: {
        title: question,
        url
      }
    });

  }
}
