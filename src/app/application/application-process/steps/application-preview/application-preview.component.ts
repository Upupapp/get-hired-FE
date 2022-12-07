import { Component, Input, OnInit } from '@angular/core';
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

    console.log(this.govFiles);
  }

  viewMore() {
    this.profileSummary = !this.profileSummary
  }

  previewVideo(question, url) {
    console.log(question);

    let dialog = this.dialog.open(VideoPreviewComponent, {
      width: '50vw',
      data: {
        title: question,
        url
      }
    });

  }
}
