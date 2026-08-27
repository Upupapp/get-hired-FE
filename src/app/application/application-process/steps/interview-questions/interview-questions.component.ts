import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroupDirective } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { VideoPreviewComponent } from '@app-shared/components/video-preview/video-preview.component';
import * as InterviewModel from '@main/interview/interview.model';

@Component({
  selector: 'app-interview-questions',
  templateUrl: './interview-questions.component.html',
  styleUrls: ['./interview-questions.component.scss'],
  animations: [mainAnimations]
})
export class InterviewQuestionsComponent implements OnInit {
  @Input() interviewTab: string = 'questions';
  @Input() interviews: InterviewModel.InterviewQuestion[];
  @Output() nextStep = new EventEmitter();


  selectedIndex: number = 0;
  answers = [];

  constructor(
    private rootFormGroup: FormGroupDirective,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    console.log(this.interviews)
    this.answers = this.interviewAnswers.value;
  }

  get interviewAnswers() {
    return this.rootFormGroup.control.get('interviewAnswers') as FormArray;
  }

  changeQuestion(index) {
    console.log(index);
    if (index < this.interviews.length) {
      this.selectedIndex = index;
    } else {
      this.nextStep.emit(4); // Go to Summary
    }
  }

  // Lets the applicant bypass the screening interview questions entirely
  // and jump straight to Summary & Submit, regardless of which question
  // they're currently on. Previously the only skip paths were the
  // one-time entry dialog and skipping questions one at a time via
  // record-interview's per-question Skip button.
  skipToSummary() {
    this.nextStep.emit(4);
  }

  submitAnswer(event) {
    console.log(event);
    const { answerFile, questionId, index, answerBlob } = event
    const array = this.fb.group({
      answerFile: new FormControl(answerFile),
      questionId: new FormControl(questionId),
      index: new FormControl(index),
      answerBlob: new FormControl(answerBlob)
    });

    this.interviewAnswers.controls.push(array);
    this.interviewAnswers.value.push({
      answerFile,
      questionId,
      index,
      answerBlob
    });

    console.log(this.interviewAnswers);
    this.changeQuestion(index + 1);
  }

  // BUGFIX: submitting an application with a recorded video answer could
  // fail with a 413 (payload too large -- the video is sent as base64 JSON,
  // see server.js's dedicated /api/application/apply limit) with no way
  // for the applicant to tell which answer was the problem or fix it short
  // of restarting the whole application. Approximates the original file
  // size from the base64 string length (base64 has no persisted Blob/File
  // by this point) so each answer's size is visible, and removeAnswer()
  // below lets the applicant drop a specific oversized answer and re-record
  // it via the Questions tab instead.
  answerSizeMb(base64: string): number {
    if (!base64) return 0;
    const commaIdx = base64.indexOf(',');
    const data = commaIdx >= 0 ? base64.slice(commaIdx + 1) : base64;
    const padding = data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0;
    const bytes = Math.floor((data.length * 3) / 4) - padding;
    return bytes / (1024 * 1024);
  }

  removeAnswer(index: number, event: Event) {
    event.stopPropagation();
    this.interviewAnswers.removeAt(index);
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
