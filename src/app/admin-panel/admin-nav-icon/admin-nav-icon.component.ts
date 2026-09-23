import { Component, Input } from '@angular/core';
import { AdminNavIcon } from '../admin-nav';

@Component({
  selector: 'app-admin-nav-icon',
  templateUrl: './admin-nav-icon.component.html',
  styleUrls: ['./admin-nav-icon.component.scss']
})
export class AdminNavIconComponent {
  @Input() name: AdminNavIcon = 'dashboard';
  @Input() size = 20;
}
