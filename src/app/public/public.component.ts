import { Component, HostListener, OnInit } from '@angular/core';
import { CoreService } from '@app-core/services/core.service';

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit {
  isUserLoggedIn: boolean;
  user = JSON.parse(localStorage.getItem('user'));

  constructor(
    private coreService: CoreService
  ) {

  }
  ngOnInit(): void {
    this.isUserLoggedIn = this.coreService.isLoggedIn();
  }
}
