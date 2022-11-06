import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@main/shared/animations/main-animations';

@Component({
  selector: 'app-employer-company-users',
  templateUrl: './employer-company-users.component.html',
  styleUrls: ['./employer-company-users.component.scss'],
  animations: [mainAnimations]
})
export class EmployerCompanyUsersComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
