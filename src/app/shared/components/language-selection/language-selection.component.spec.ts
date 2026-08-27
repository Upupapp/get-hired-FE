import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

import { LanguageSelectionComponent } from './language-selection.component';
import { configureComponentTestingModule } from '../../../../testing/component-harness';

describe('LanguageSelectionComponent', () => {
  let component: LanguageSelectionComponent;
  let fixture: ComponentFixture<LanguageSelectionComponent>;

  beforeEach(async () => {
    await configureComponentTestingModule({
      declarations: [ LanguageSelectionComponent ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(LanguageSelectionComponent);
    component = fixture.componentInstance;
    // ngOnInit does `translateService.currentLang.match(...)`. TestBed's
    // TranslateModule.forRoot() starts with no active language, so currentLang
    // is undefined until one is selected.
    TestBed.inject(TranslateService).use('en');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
