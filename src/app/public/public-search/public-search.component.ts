import { Component, HostListener, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { AdminService } from '@app-shared/services/auth/admin/admin.service';
import { Subscription } from 'rxjs';
import { 
  Router, 
  ActivatedRoute 
} from '@angular/router';

@Component({
  selector: 'app-public-search',
  animations: [mainAnimations],
  templateUrl: './public-search.component.html',
  styleUrls: ['./public-search.component.scss']
})
export class PublicSearchComponent implements OnInit {
  public screenSize: number = 1600;
  public loggedUserData: any = JSON.parse(localStorage.getItem('userData'));
  public loggedUser: any;
  private req?: Subscription;
  public userRole: string;

  public jobSearch = JSON.parse(sessionStorage.getItem('job-search'));
  public keyword: string;  
  public work_setup: string = 'Work Setup';  
  public job_type: string = 'Job Type';

  constructor(private router:Router, 
    private activatedRoute: ActivatedRoute,) { 
  }

  asyncLocalStorage = {
    setItem: async function (key, value) {
      await Promise.resolve();
      localStorage.setItem(key, value);
    },
    getItem: async function (key) {
      await Promise.resolve();
      return localStorage.getItem(key);
    }
  };

  ngOnInit(): void {
    this.screenSize = window.innerWidth;
    this.keyword = this.keyword != 'undefined' ? this.keyword : '';
    this.work_setup = this.work_setup != 'undefined' ? this.work_setup : '';
    this.job_type = this.job_type != 'undefined' ? this.job_type : '';
    this.getUserRole();
  }

  async getUserRole() {
    this.userRole = await this.asyncLocalStorage.getItem('role') || null;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }

  findJobs(){
    let init_route = `/job-post/${this.keyword}`;
    let work_setup = this.work_setup !== 'Work Setup' ? init_route.concat(`/${this.work_setup?.toLowerCase()}`) : init_route;
    let job_type = this.job_type !== 'Job Type' ? work_setup.concat(`/${this.job_type?.toLowerCase()}`) : work_setup;

    /*if(this.keyword){
      console.log(job_type)
      this.router.navigate([job_type]);
    }

    else if(!this.keyword && (this.work_setup !== 'Work Setup' || this.job_type !== 'Job Type')) {
      init_route = `/job-post`;
      work_setup = this.work_setup !== 'Work Setup' ? init_route.concat(`/${this.work_setup?.toLowerCase()}`) : init_route;
      job_type = this.job_type !== 'Job Type' ? work_setup.concat(`/${this.job_type?.toLowerCase()}`) : work_setup;

      this.router.navigate([job_type]);
    }*/

    let job_search_data = {
      keyword: this.keyword,  
      work_setup: this.work_setup,  
      job_type: this.job_type
    };

    this.router.navigate([`/jobs`]).then(() => this.router.navigate([`jobs/search/${this.keyword}`]))

    sessionStorage.setItem('job-search', JSON.stringify(job_search_data));

    console.log(job_search_data)

  }
}
