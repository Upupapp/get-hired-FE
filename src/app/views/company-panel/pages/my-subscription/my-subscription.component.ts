import { 
  Component, 
  OnInit, 
  OnDestroy
} from '@angular/core';
import { mainAnimations } from '@app-shared/animations/main-animations';

@Component({
  selector: 'app-my-subscription',
  animations: [mainAnimations],
  templateUrl: './my-subscription.component.html',
  styleUrls: ['./my-subscription.component.scss']
})
export class MySubscriptionComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
