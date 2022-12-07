import { Component, Input, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { AdminService } from '@app-shared/services/auth/admin/admin.service';
import { Subscription } from 'rxjs';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import { quotes } from './stat.mock.data';

@Component({
  selector: 'app-applicant-stat-total',
  animations: [mainAnimations],
  templateUrl: './stat-total.component.html',
  styleUrls: ['./stat-total.component.scss']
})
export class StatTotalComponent implements OnInit {
  messages = quotes;
  message: string;
  @Input() totals: number = 0;

  constructor() { }

  ngOnInit(): void { }

}
