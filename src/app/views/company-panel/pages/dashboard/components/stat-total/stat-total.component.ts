import { Component, OnInit } from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';
import { AdminService } from '@app-shared/services/auth/admin/admin.service';
import { Subscription } from 'rxjs';
import { 
  Router, 
  ActivatedRoute 
} from '@angular/router';

@Component({
  selector: 'app-stat-total',
  animations: [mainAnimations],
  templateUrl: './stat-total.component.html',
  styleUrls: ['./stat-total.component.scss']
})
export class StatTotalComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
