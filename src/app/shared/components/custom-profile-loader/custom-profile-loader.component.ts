import { 
  Component,
  OnInit, 
  Input 
} from '@angular/core';
import { mainAnimations } from '../../animations/main-animations';

@Component({
  selector: 'custom-profile-loader',
  animations: [mainAnimations],
  templateUrl: './custom-profile-loader.component.html',
  styleUrls: ['./custom-profile-loader.component.scss']
})
export class CustomProfileLoaderComponent implements OnInit {
  @Input() loading: boolean = true;
  @Input() withSideBar: boolean = false;
  @Input() fromDetailTab: boolean = false;
  @Input() formOnly: boolean = false;
  @Input() tableOnly: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
