import { Component, OnInit, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { Router, ActivatedRoute } from '@angular/router';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';
import {
  Subscription,
  Observable,
  forkJoin,
  combineLatest
} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as Model from '@main/interview/interview.model';
import { CoreService } from '@app-core/services/core.service';

@Component({
  selector: 'app-record-interview',
  animations: [mainAnimations],
  templateUrl: './record-interview.component.html',
  styleUrls: ['./record-interview.component.scss']
})
export class RecordInterviewComponent implements OnInit {
  @Input() interviews: Model.InterviewQuestion[];
  @Input() index: number;

  private req: Subscription;
  private unsubscribe$ = new Subject<void>();

  fullName: string;

  public interview_questions: any[] = [
    "How long have you been using Angular?",
    "Have you use ngRx/ngsx and rxJS before?",
    "Are you available for short term or long term?",
    "Describe your previous project and experience",
    "How did this job post interests you?"
  ];

  public interview_answers: any[] = [
    "Are you willing to learn ReactJS on other projects?"
  ];

  public question: any = "How long have you been using Angular?"
  public startRecording: boolean = false;
  public recordedData: any;
  public interviewTab: string = 'questions';
  public time: number = 0;
  public interval;
  public display: any = '00:00';
  public timer_value: number = 0;

  constructor(public router: Router,
    private dialog: MatDialog,
    public route: ActivatedRoute,
    private coreService: CoreService
  ) { }

  ngOnInit(): void {
    this.coreService.getUserFullName().then(name => this.fullName = name);
  }

  getQuestionIndex(question){
    return [this.question, this.interview_questions].findIndex(el => el === question) + 1;
  }

  startRecorder(){
    this.startRecording = true;
    this.startTimer();
  }

  stopRecorder(){
    this.pauseTimer();
    this.startRecording = false;
    this.timer_value = 0;
    this.display = '00:00';
    this.recordedData = 'TEST';
    clearInterval(this.timer_value);
  }


  startTimer() {
    this.interval = setInterval(() => {
      if (this.time === 0) {
        this.time++;
      } else {
        this.time++;
      }
      this.timer_value+= 1;
      this.display=this.transform( this.time)
    }, 150);
  }

  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    return ('00' + minutes).slice(-2) + ':' + ('00' + Math.floor(value - minutes * 60)).slice(-2);
  }

  pauseTimer() {
    clearInterval(this.interval);
  }

  openInterviewSettings(data?: any) {
    let dialogModal = this.dialog.open(
      SettingsModalComponent,
      {
        minWidth: '30vw',
        data: data,
      }
    );

    dialogModal
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(result => {

      });
  }
}

