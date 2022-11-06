import { Component, OnInit } from '@angular/core';
import { CoreService } from '@main/core/services/core.service';

@Component({
  selector: 'app-employer-panel',
  templateUrl: './employer-panel.component.html',
  styleUrls: ['./employer-panel.component.scss']
})
export class EmployerPanelComponent implements OnInit {

  isUserLoggedIn: boolean;

  constructor(
    private coreService: CoreService
  ) { }

  ngOnInit(): void {
    console.log('im here');
    this.isUserLoggedIn = this.coreService.isLoggedIn();
  }

}
