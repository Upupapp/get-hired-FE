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
import { jobLists, Job } from '../../utils/jobs-opening-model-interface';
//import { companyLists, Company } from '../../utils/company-list-model-interface';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-jobs-opening-details',
  animations: [mainAnimations],
  templateUrl: './jobs-opening-details.component.html',
  styleUrls: ['./jobs-opening-details.component.scss']
})
export class JobsOpeningDetailsComponent implements OnInit {
  public loading: boolean = true;
  public screenSize: number = 1600;
  public jobLists: Job[] = jobLists;
  public listView: boolean = false;
  public selectedJobPost: Job;
  public viewMoreJobDetails: boolean = false;
  
  constructor(public router: Router,  
    public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.screenSize = window.innerWidth;

    let id = this.route.snapshot.params['id'] * 1;
    this.selectedJobPost = this.jobLists.find(el => el.id === id);

    console.log(id, this.selectedJobPost)

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  viewMore(){
    this.viewMoreJobDetails = !this.viewMoreJobDetails;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }

}
