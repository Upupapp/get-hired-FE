import { Component, OnInit } from '@angular/core';
import  { 
  displayedColumns,
  selectedColumns,
  TableHeader,
  Job,
  jobLists
} from '../jobs/utils/jobs-model-interface'; 
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-account-details',
  animations: [mainAnimations],
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss']
})
export class AccountDetailsComponent implements OnInit {
  public latestjobs: Job[] = jobLists;
  constructor() { }

  ngOnInit(): void {
  }

}
