import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@main/shared/animations/main-animations';

@Component({
  selector: 'app-employer-company-details',
  templateUrl: './employer-company-details.component.html',
  styleUrls: ['./employer-company-details.component.scss'],
  animations: [mainAnimations]
})
export class EmployerCompanyDetailsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
