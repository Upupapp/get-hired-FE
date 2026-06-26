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
