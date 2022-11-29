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
//import { jobLists, Job } from '../../utils/jobs-opening-details.component';
import { companyLists, Company } from '@main/views/home/utils/company-list-model-interface';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-job-details-section',
  animations: [mainAnimations],
  templateUrl: './job-details-section.component.html',
  styleUrls: ['./job-details-section.component.scss']
})
export class JobDetailsSectionComponent implements OnInit {
  ngOnInit(): void{}
  /*public loading: boolean = true;
  public screenSize: number = 1600;
  public jobLists: Job[] = jobLists;
  public companyLists: Company[] = companyLists;
  public listView: boolean = false;
  public selectedJobPost: Job;
  public selectedCompany: Company;

  constructor(public router: Router,  
    public location: Location,
    public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.screenSize = window.innerWidth;

    let id = this.route.snapshot.params['job-id'] * 1;

    this.selectedJobPost = this.jobLists.find(el => el.id == id);

    this.selectedCompany = this.companyLists.find(el => el.id === this.selectedJobPost?.company_id);
    console.log(id, this.selectedJobPost)

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }


  goBack(){
    this.location.back();
  }*/

}
