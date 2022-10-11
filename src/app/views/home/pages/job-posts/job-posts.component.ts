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
import { 
  Router, 
  ActivatedRoute 
} from '@angular/router';
import { AdminService } from '@app-shared/services/auth/admin/admin.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-job-posts',
  animations: [mainAnimations],
  templateUrl: './job-posts.component.html',
  styleUrls: ['./job-posts.component.scss']
})
export class JobPostsComponent implements OnInit {

  private req: Subscription;
  public loading: boolean = true;
  public screenSize: number = 1600;

  public jobLists: Job[] = jobLists;
  public listView: boolean = false;

  public loggedUser: any;
  public loggedUserData: any = JSON.parse(localStorage.getItem('userData'));
  public location: any;


  constructor(private router:Router, 
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService) { 

    this.req = this.router.events.subscribe((event: any) => {
      this.location = this.router.url;

      this.adminService.adminStatus$.subscribe((result: any) => {
        this.loggedUser = result;
        this.loggedUserData = JSON.parse(localStorage.getItem('userData'));
      });
    });
  }

  ngOnInit(): void {
    this.screenSize = window.innerWidth;
  }

  ngOnDestroy(): void {
    if(this.req) this.req.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }

}
