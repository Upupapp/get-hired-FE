import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  OnChanges,
  OnInit,
  OnDestroy,
  HostListener
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { JobsFacade } from '../state/jobs.facade';

@Component({
  selector: 'app-job-posts-list',
  animations: [mainAnimations],
  templateUrl: './job-posts-list.component.html',
  styleUrls: ['./job-posts-list.component.scss']
})
export class JobPostsListComponent implements OnInit {
  @Input() fromSearch: boolean = false;
  @Input() label: string;
  @Input() subLabel: string = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt <br>ut labore et dolore magna aliqua.`;
  @Input() companyId?: string;
  @Input() searchData?: any;

  public loading: boolean = true;
  public screenSize: number = 1600;
  public listView: boolean = false;

  list$ = this.jobsFacade.jobList$;

  constructor(
    private jobsFacade: JobsFacade,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      this.companyId = params.id
    });
  }

  ngOnInit(): void {
    this.jobsFacade.getPublishedList(this.companyId);
    this.screenSize = window.innerWidth;
  }

  filterJobList(jobLists: any[]){
    if(this.searchData) 
      return jobLists.filter((el: any) => JSON.stringify(el).toLowerCase().match(this.searchData?.keyword.toLowerCase()));  

    return jobLists
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }
}
