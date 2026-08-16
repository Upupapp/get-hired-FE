import { Component } from '@angular/core';

/**
 * Thin tab shell for the Interviews area. Hosts two sections via child
 * routes so the existing RecruiterInterviewHubComponent (video-answer
 * activity feed) keeps its exact current behavior and URL
 * (`/recruiter/interview`) -- this shell only adds a second tab
 * ("Scheduled Interviews") alongside it, per the Internal Interview
 * Scheduling MVP. Nothing about the Hub itself changes.
 */
@Component({
  selector: 'app-interviews-shell',
  templateUrl: './interviews-shell.component.html',
  styleUrls: ['./interviews-shell.component.scss'],
})
export class InterviewsShellComponent {}
