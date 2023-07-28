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
import { TranslateService } from '@ngx-translate/core';
import { filter, map, mergeMap, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title = 'Get Hired';
  isSmallScreen: boolean = false;
  isSmallScreenAllowed: boolean;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public translateService: TranslateService
  ) {
    // this.location = this.router.url;
    // this.req = this.router.events.subscribe((event: any) => {
    //   if(event){

    //   }
    // });
  }

  ngOnInit(): void {
    const browserLang: any = this.translateService.getBrowserLang();
    const selectedLang: any = localStorage.getItem("selectedLang")
    this.translateService.use(selectedLang ? selectedLang: browserLang.match(/en|vie/) ? browserLang : 'en');
    this.checkScreenSize();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.rootRoute(this.route)),
      filter((route: ActivatedRoute) => route.outlet === 'primary'),
      mergeMap((route: ActivatedRoute) => route.data)
    ).subscribe((event: {[name: string]: any}) => {

      this.isSmallScreenAllowed = event['isMobileViewAllowed'] ? event['isMobileViewAllowed']: false;

      console.log(this.isSmallScreenAllowed);
      this.checkScreenSize();

    });
  }

  checkScreenSize() {
    const height = window.screen.availHeight;
    const width = window.screen.availWidth;

    if(width < 1025) {
      this.isSmallScreen = true;
    }
  }

  private rootRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }



}
