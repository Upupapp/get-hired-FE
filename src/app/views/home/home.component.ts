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
import { mainAnimations } from '../../shared/animations/main-animations';
import { jobLists, Job } from './utils/job-list-model-interface';

@Component({
  selector: 'app-home',
  animations: [mainAnimations],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public loading: boolean = true;
  public screenSize: number = 1600;

  public jobLists: Job[] = jobLists;

  constructor() { }

  ngOnInit(): void {
    this.screenSize = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }
}
