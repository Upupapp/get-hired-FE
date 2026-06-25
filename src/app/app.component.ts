import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title = 'Get Hired';

  constructor(public translateService: TranslateService) {}

  ngOnInit(): void {
    const browserLang: any = this.translateService.getBrowserLang();
    const selectedLang: any = localStorage.getItem("selectedLang");
    this.translateService.use(selectedLang ? selectedLang : browserLang.match(/en|vie/) ? browserLang : 'en');
  }
}
