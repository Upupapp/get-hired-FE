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
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-job-post-search-list',
  animations: [mainAnimations],
  templateUrl: './job-post-search-list.component.html',
  styleUrls: ['./job-post-search-list.component.scss']
})
export class JobPostSearchListComponent implements OnInit {
  public searchJobPost: string = `Try adjusting your search or find what you’re looking for. <br> Note sure where to start? <a href="/job-post">Browse Job</a>.`
  public loading: boolean = true;
  public screenSize: number = 1600;

  public jobLists: Job[] = jobLists;
  public listView: boolean = false;

  public keyword: string;  
  public work_setup: string;  
  public job_type: string;


  constructor(private router: Router,  
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.keyword = this.route.snapshot.params['keyword'] != 'undefined' ? this.route.snapshot.params['keyword'] : '';
    this.work_setup = this.route.snapshot.params['work_setup'] != 'undefined' ? this.route.snapshot.params['work_setup'] : '';
    this.job_type = this.route.snapshot.params['job_type'] != 'undefined' ? this.route.snapshot.params['job_type'] : '';

    console.log(this.keyword, this.work_setup, this.job_type)

    let searchEl = (el, str) => JSON.stringify(el).toLowerCase().match(str.toLowerCase())

    this.jobLists = [...this.jobLists].filter(el => 
      {
        if(this.keyword) 
          return searchEl(el, this.keyword);  

        else if(this.work_setup && !this.job_type) 
          return el?.work_setup?.toLowerCase() === this.work_setup?.toLowerCase(); 

        else if(this.work_setup && this.job_type)
          return el?.work_setup?.toLowerCase() === this.work_setup?.toLowerCase() || 
          el?.job_type?.toLowerCase() === this.job_type?.toLowerCase() 
      }

      /*searchEl(el, this.keyword) && 
      (this.work_setup ? searchEl(el, this.work_setup) : true) && 
      (this.job_type ? searchEl(el, this.job_type) : true)*/
    )

    console.log(this.jobLists)

    this.screenSize = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }

}
