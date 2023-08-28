import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-employer-interview-question-templates',
  templateUrl: './employer-interview-question-templates.component.html',
  styleUrls: ['./employer-interview-question-templates.component.scss'],
  animations: [mainAnimations]
})
export class EmployerInterviewQuestionTemplatesComponent implements OnInit {

  constructor(
    private router: Router,
    public route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
  }

  createTemplate() {
    this.router.navigate(['../question-template'], { relativeTo: this.route })
  }

}
