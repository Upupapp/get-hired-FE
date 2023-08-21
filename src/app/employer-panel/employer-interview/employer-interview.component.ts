import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-employer-interview',
  animations: [mainAnimations],
  templateUrl: './employer-interview.component.html',
  styleUrls: ['./employer-interview.component.scss']
})
export class EmployerInterviewComponent implements OnInit, OnDestroy {

  constructor() {  }

  ngOnInit(): void { }


  ngOnDestroy(): void { }

}
