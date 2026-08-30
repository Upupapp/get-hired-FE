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
    const { answerFile, questionId, index, answerBlob } = event

    // BUGFIX: this used to unconditionally push a new FormArray entry, so
    // using "Change Video" (or re-recording via the Questions tab) on a
    // question that already had an answer created a SECOND entry for the
    // same index instead of replacing the first -- both got submitted,
    // and the stale one silently reappeared in the Answers list alongside
    // the new one. Remove any existing entry for this question index first.
    const existingIdx = this.interviewAnswers.controls.findIndex(
      (ctrl) => ctrl.value.index === index
    );
    if (existingIdx > -1) {
      this.interviewAnswers.removeAt(existingIdx);
    }

    const array = this.fb.group({
      answerFile: new FormControl(answerFile),
      questionId: new FormControl(questionId),
      index: new FormControl(index),
      answerBlob: new FormControl(answerBlob)
    });

    this.interviewAnswers.controls.push(array);

    this.changeQuestion(index + 1);
  }

  // Question indices that already have a recorded/uploaded answer -- lets
  // the Questions tab show "already answered" state and label the action
  // "Change Video" instead of "Record / Upload Interview".
  get answeredIndices(): Set<number> {
    return new Set(this.interviewAnswers.controls.map((ctrl) => ctrl.value.index));
  }

  answerSizeMbForIndex(index: number): number {
    const ctrl = this.interviewAnswers.controls.find((c) => c.value.index === index);
    return ctrl ? this.answerSizeMb(ctrl.value.answerFile) : 0;
  }

  // "Change Video" action from the Answers tab -- jumps the always-visible
  // recorder (above the tabs) to this question so the applicant can
  // re-record/upload without leaving the page. submitAnswer() above
  // replaces the existing entry for this index rather than duplicating it.
  changeVideo(index: number, event: Event): void {
    event.stopPropagation();
    this.selectedIndex = index;
    this.interviewTab = 'questions';
    // The recorder is always rendered above the tabs, so "Change Video"
    // otherwise leaves the applicant staring at the same scroll position
    // with no visual confirmation anything happened. Scroll them to it.
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

  // Map of question index -> its already-recorded answer, passed down to
  // app-record-interview so that navigating (via Change Video, the
  // Questions tab, or the recorder's own question strip) to a question
  // that already has an answer shows that video loaded in the preview
  // player instead of a blank "start recording" prompt -- letting the
  // applicant actually see what's attached before deciding whether to
  // replace it, rather than being forced to re-record blind.
  get existingAnswersByIndex(): { [index: number]: { answerBlob: any; answerFile: any } } {
    const map: { [index: number]: { answerBlob: any; answerFile: any } } = {};
    this.interviewAnswers.controls.forEach((ctrl) => {
      map[ctrl.value.index] = {
        answerBlob: ctrl.value.answerBlob,
        answerFile: ctrl.value.answerFile,
      };
    });
    return map;
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
