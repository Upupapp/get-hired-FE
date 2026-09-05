import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroupDirective } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { VideoPreviewComponent } from '@app-shared/components/video-preview/video-preview.component';
import { SnackbarService } from '@app-core/services/snackbar.service';
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
  // BUGFIX: mirrors app-record-interview's isVideoRecording, via its
  // recordingStateChange output. Every way to switch away from the
  // question currently being recorded -- clicking another question in
  // the Questions tab, "Change Video" from the Answers tab, and the
  // top-level "Skip Interview" escape hatch -- is guarded against this,
  // so an in-progress take can no longer be silently abandoned.
  isRecording = false;

  constructor(
    private rootFormGroup: FormGroupDirective,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public sanitizer: DomSanitizer,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    console.log(this.interviews)
    this.answers = this.interviewAnswers.value;
  }

  get interviewAnswers() {
    return this.rootFormGroup.control.get('interviewAnswers') as FormArray;
  }

  // BUGFIX: this had no awareness at all of an in-progress recording --
  // it's the handler behind clicking a different question in the
  // Questions tab (and the natural Next/Skip flow), so that click alone
  // could silently abandon a take mid-recording. Now blocked while
  // isRecording is true (kept in sync via onRecordingStateChange()).
  changeQuestion(index) {
    if (this.isRecording) {
      this.snackbarService.info('Please stop or finish your current recording before switching questions.', '', 4000);
      return;
    }
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
    if (this.isRecording) {
      this.snackbarService.info('Please stop or finish your current recording first.', '', 4000);
      return;
    }
    this.nextStep.emit(4);
  }

  // Kept in sync with app-record-interview's isVideoRecording via its
  // recordingStateChange output.
  onRecordingStateChange(recording: boolean): void {
    this.isRecording = recording;
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

    // ROOT-CAUSE FIX (production): this pushed directly into
    // interviewAnswers.controls -- the FormArray's internal array -- instead
    // of calling interviewAnswers.push(array), the actual FormArray API.
    // Angular's FormArray.value is a cached snapshot only recomputed inside
    // the real push()/removeAt()/etc. methods, not a live getter over
    // .controls; a raw .controls.push() correctly grows .controls.length
    // (so this component's own answeredIndices/answerSizeMbForIndex, both
    // of which iterate .controls directly, looked completely correct) but
    // never touches the cached .value Step 4's summary actually reads
    // (application-preview.component.ts's answersArray.value) -- so a
    // genuinely-recorded, genuinely-submitted answer could still show as
    // "You skipped the interview questions" on Step 4 every time.
    this.interviewAnswers.push(array);

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
    if (this.isRecording) {
      this.snackbarService.info('Please stop or finish your current recording before switching questions.', '', 4000);
      return;
    }
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
