import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selection',
  templateUrl: './language-selection.component.html',
  styleUrls: ['./language-selection.component.scss']
})
export class LanguageSelectionComponent implements OnInit {

  selectedLang: any = 'en' 

  public languages: any[] = [
    {id: "en", name: "English"},
    {id: "vie", name: "Vietnamese"}
  ];
  constructor(
    public translateService: TranslateService
  ) { }

  ngOnInit(): void {
    const browserLang: any = this.translateService.currentLang;
    this.selectedLang = browserLang.match(/en|vie/) ? browserLang : 'en';
  }

  changeLanguage(data: any){
    this.translateService.use(data);
    localStorage.setItem("selectedLang", data)
    location.reload();
  }

}
