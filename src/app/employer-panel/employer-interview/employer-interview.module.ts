import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@app-shared/shared.module';
// B03: RecruiterInterviewHub replaces the under-construction stub at /recruiter/interview
import { RecruiterInterviewHubComponent } from '../recruiter-interview-hub/recruiter-interview-hub.component';
// Internal Interview Scheduling MVP -- adds a "Scheduled Interviews" tab
// alongside the existing Hub (video-answer activity feed), which keeps its
// exact current behavior and URL. InterviewsShellComponent only adds the
// tab nav + router-outlet; it does not alter RecruiterInterviewHubComponent.
import { InterviewsShellComponent } from './interviews-shell/interviews-shell.component';
import { ScheduledInterviewsListComponent } from './scheduled-interviews-list/scheduled-interviews-list.component';
import { InterviewDetailComponent } from './interview-detail/interview-detail.component';
// Phase 1.5B -- Hiring Calendar: a presentation-only third tab over the
// same GET /interview/scheduled data the List tab already uses.
import { HiringCalendarComponent } from './hiring-calendar/hiring-calendar.component';
import { DayViewComponent } from './hiring-calendar/day-view/day-view.component';
import { WeekViewComponent } from './hiring-calendar/week-view/week-view.component';
import { MonthViewComponent } from './hiring-calendar/month-view/month-view.component';
import { CalendarEventCardComponent } from './hiring-calendar/calendar-event-card/calendar-event-card.component';

const routes: Routes = [
  {
    path: '',
    component: InterviewsShellComponent,
    children: [
      { path: '', component: RecruiterInterviewHubComponent },
      { path: 'calendar', component: HiringCalendarComponent },
      { path: 'scheduled', component: ScheduledInterviewsListComponent },
      { path: 'scheduled/:interviewId', component: InterviewDetailComponent },
    ],
  },
]

@NgModule({
  declarations: [
    RecruiterInterviewHubComponent,
    InterviewsShellComponent,
    ScheduledInterviewsListComponent,
    InterviewDetailComponent,
    HiringCalendarComponent,
    DayViewComponent,
    WeekViewComponent,
    MonthViewComponent,
    CalendarEventCardComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class EmployerInterviewModule { }
