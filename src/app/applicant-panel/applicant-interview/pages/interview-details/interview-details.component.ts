
import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroupDirective } from '@angular/forms';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  Subscription, 
} from 'rxjs';
import { 
  select, 
  Store 
} from '@ngrx/store';
import { 
  displayedColumns,
  selectedColumns,
  TableHeader,
  Interview,
  interviewLists
} from '../../utils/applicant-interview-model-interface';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import * as InterviewModel from '@main/interview/interview.model';

@Component({
  selector: 'app-interview-details',
  animations: [mainAnimations],
  templateUrl: './interview-details.component.html',
  styleUrls: ['./interview-details.component.scss']
})
export class InterviewDetailsComponent implements OnInit {
  @Input() interviewTab: string = 'questions';
  @Input() interviews: InterviewModel.InterviewQuestion[];

  private req: Subscription;
  private unsubscribe$ = new Subject<void>();
  public routerUrl: any[] = [];
  public loading: boolean = true;
  public id;
  public displayedColumns: TableHeader[] = displayedColumns;
  public interviewLists: Interview[] = interviewLists;
  public listView: boolean = true;
  public selectedColumns: string[] = selectedColumns;
  public interviewDetails: any = {};
  selectedIndex: number = 0;
  answers = [];

  

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private rootFormGroup: FormGroupDirective,
    private fb: FormBuilder,
    public sanitizer: DomSanitizer,
    private snackBar: MatSnackBar) {
    this.id = this.route.snapshot.params['id'];  
    this.interviewDetails = this.interviewLists.find(el => el?.id == this.id);
  }

  ngOnInit(): void {
    setTimeout(() => this.loading = false, 1500);
    console.log(this.interviews)
    this.answers = this.interviewAnswers.value;
  }

  ngOnDestroy(): void {
    if(this.req) this.req.unsubscribe();
  }

  get interviewAnswers() {
    return this.rootFormGroup.control.get('interviewAnswers') as FormArray;
  }

  changeQuestion(index) {
    console.log(index);
    if (index < this.interviews.length) {
      this.selectedIndex = index;
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
    /*console.log(question);

    let dialog = this.dialog.open(VideoPreviewComponent, {
      width: '50vw',
      data: {
        title: question,
        url
      }
    });*/

  }

}
