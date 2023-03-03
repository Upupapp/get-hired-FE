import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as Model from '../interview.model';

@Component({
  selector: 'app-update-question',
  templateUrl: './update-question.component.html',
  styleUrls: ['./update-question.component.scss']
})
export class UpdateQuestionComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<UpdateQuestionComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) { }

  ngOnInit(): void {}

  editQuestion(item: Model.InterviewQuestion) {
    this.dialogRef.close(item);
  }

}
