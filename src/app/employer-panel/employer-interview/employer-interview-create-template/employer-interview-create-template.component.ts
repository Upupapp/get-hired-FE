import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-employer-interview-create-template',
  templateUrl: './employer-interview-create-template.component.html',
  styleUrls: ['./employer-interview-create-template.component.scss']
})
export class EmployerInterviewCreateTemplateComponent implements OnInit {
  interviewTemplate: FormGroup;
  questions = [];

  constructor(
    private router: Router,
    public route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
  }

  getBack() {
    this.router.navigate(['../'], { relativeTo: this.route })
  }

  redirect() {
    window.history.back()
    // this.router.navigate(['../create'], { relativeTo: this.route, queryParams: { step: '1' }})
  }
}
