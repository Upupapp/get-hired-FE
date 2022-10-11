import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { AdminService } from '@app-shared/services/auth/admin/admin.service';
import { Subscription } from 'rxjs';
import { 
  Router, 
  ActivatedRoute 
} from '@angular/router';

@Component({
  selector: 'app-explore-users',
  animations: [mainAnimations],
  templateUrl: './explore-users.component.html',
  styleUrls: ['./explore-users.component.scss']
})
export class ExploreUsersComponent implements OnInit {
  @Input() loggedUserData: any = {};
  constructor() { }

  ngOnInit(): void {
  }

}
