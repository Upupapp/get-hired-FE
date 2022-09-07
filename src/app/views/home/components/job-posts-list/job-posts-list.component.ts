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
import { mainAnimations } from '@app-shared/animations/main-animations';
import { jobLists, Job } from '../../utils/job-list-model-interface';

@Component({
  selector: 'app-job-posts-list',
  animations: [mainAnimations],
  templateUrl: './job-posts-list.component.html',
  styleUrls: ['./job-posts-list.component.scss']
})
export class JobPostsListComponent implements OnInit {

  public loading: boolean = true;
  public screenSize: number = 1600;

  public jobLists: Job[] = jobLists;
  public listView: boolean = false;
  constructor() { }

  ngOnInit(): void {
    this.screenSize = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }
}
