import { Component, OnInit } from '@angular/core';
import { CoreService } from '@app-core/services/core.service';
import { AdminFacade } from './state/admin.facade';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  isUserLoggedIn: boolean;

  local = JSON.parse(localStorage.getItem('user'));
  user$ = this.adminFacade.user$;

  constructor(
    private coreService: CoreService,
    private adminFacade: AdminFacade
  ) { }

  ngOnInit(): void {

    this.isUserLoggedIn = this.coreService.isLoggedIn();
    this.adminFacade.getUser(this.local._id)
  }

}
