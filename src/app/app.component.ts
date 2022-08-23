import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  OnChanges,
  OnInit,
  OnDestroy,
  HostListener
} from '@angular/core';
import * as AOS from 'aos';
import {
  ActivatedRoute,
  NavigationEnd,
  Router
} from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title = 'Life Guide';
  private req: Subscription;
  private location: string = '';
  private screenSize: number = 1600;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
  ) {
    this.location = this.router.url;
    this.req = this.router.events.subscribe((event: any) => {
      if(event){

      }
    });
  }

  ngOnInit(): void {
  }





}
