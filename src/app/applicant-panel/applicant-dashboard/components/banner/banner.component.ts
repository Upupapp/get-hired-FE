import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { AdminService } from '@app-shared/services/auth/admin/admin.service';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-applicant-panel-banner',
  animations: [mainAnimations],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})
export class BannerComponent implements OnInit {
  public loggedUserData: any = JSON.parse(localStorage.getItem('userData'));
  @Input() details;
  constructor() {}

  ngOnInit(): void {}
}
