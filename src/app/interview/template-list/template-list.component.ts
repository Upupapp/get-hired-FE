import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from '../interview.model';
import { InterviewFacade } from '../state/interview.facade';
import { map } from 'rxjs';

@Component({
  selector: 'app-template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
  animations: [mainAnimations]
})
export class TemplateListComponent implements OnInit {
  loading: boolean = true;
  interviewTemplatesLists: Model.InterviewQuestionTemplate[] = [];
  displayedColumns: Model.TableHeader[];
  selectedColumns: string[] = [
    'jobInterviewTemplateId',
    'jobInterviewTemplateName',
    'createdAt',
    'numberOfQuestions',
    'action'
  ];

  searchSource: any = (el) => {
    return {
      id: el.jobInterviewTemplateId,
      jobInterviewTemplateName: el.jobInterviewTemplateName
    };
  };

  loading$ = this.interviewFacade.loading$.pipe().subscribe(this.onLoad.bind(this));
  list$ = this.interviewFacade.interviewTemplatesList$;

  constructor(
    private interviewFacade: InterviewFacade
  ) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user.companyId) {
      this.interviewFacade.getInterviewTemplatesList(user.companyId);
    }

    this.displayedColumns = [
      { col_name: 'jobInterviewTemplateId', title: 'ID' },
      { col_name: 'jobInterviewTemplateName', title: 'Invite List Name' },
      { col_name: 'createdAt', title: 'Date Created', type: 'date' },
      { col_name: 'numberOfQuestions', title: 'Number Of Questions' },
      { col_name: 'action', title: 'Action', type: 'menu' },
    ];
  }

  viewMenu(event): void {
    // TODO
  }

  onLoad(isLoading: boolean) {
    this.loading = isLoading;
  }

}
