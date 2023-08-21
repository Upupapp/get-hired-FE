import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import * as Model from '../interview.model';
import { InterviewFacade } from '../state/interview.facade';
import { map } from 'rxjs';

@Component({
  selector: 'app-interview-list',
  templateUrl: './interview-list.component.html',
  styleUrls: ['./interview-list.component.scss'],
  animations: [mainAnimations]
})
export class InterviewListComponent implements OnInit {
  loading: boolean = true;
  interviewLists: Model.GroupInterview[] = [];
  displayedColumns: Model.TableHeader[];
  selectedColumns: string[] =  [
    'id',
    'interviewGroupName',
    'createdAt',
    'numberOfRecipient',
    'action'
  ];

  searchSource: any = (el) => {
    return {
      id: el.groupInterviewId,
      interviewGroupName: el.interviewGroupName
    };
  };

  loading$ = this.interviewFacade.loading$.pipe().subscribe(this.onLoad.bind(this));
  list$ = this.interviewFacade.interviewList$
    .pipe(
      map(interviews => {
        return interviews.map(interview => {
          return {
            ...interview,
            numberOfRecipient: interview.recipients.length
          }
        })
      })
    );

  constructor(
    private interviewFacade: InterviewFacade
  ) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user'));
    if(user.companyId) {
      this.interviewFacade.getInterviewList(user.companyId);
    }

    this.displayedColumns = [
      { col_name: 'id', title: 'ID'  },
      { col_name: 'groupInterviewName', title: 'Invite List Name'  },
      { col_name: 'createdAt', title: 'Date Sent', type: 'date'  },
      { col_name: 'numberOfRecipient', title: 'Number Of Recipient'  },
      { col_name: 'action', title: 'Action' , type: 'menu' },
    ];
  }

  viewMenu(event): void {
    // TODO
  }

  onLoad(isLoading: boolean) {
    this.loading = isLoading;
  }

}
