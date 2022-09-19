import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { AdminService } from '@app-shared/services/auth/admin/admin.service';
import { Subscription } from 'rxjs';
import { 
  Router, 
  ActivatedRoute 
} from '@angular/router';

@Component({
  selector: 'app-job-details-sidecard',
  animations: [mainAnimations],
  templateUrl: './job-details-sidecard.component.html',
  styleUrls: ['./job-details-sidecard.component.scss']
})
export class JobDetailsSidecardComponent implements OnInit {
  @Input() screenSize: number = 1600;
  @Input() company: any;
  @Input() data: any;
 
  public loggedInApplicant: any;
  private req?: Subscription;

  constructor(private router:Router, 
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService) { 
    this.req = this.router.events.subscribe((event: any) => {
      this.adminService.adminStatus$.subscribe((result: any) => {
        this.loggedInApplicant = result;
      });
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if(this.req) this.req.unsubscribe();
  }

}
