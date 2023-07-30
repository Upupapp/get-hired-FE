import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app.routing.module';
import { SharedModule } from './shared/shared.module';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AppFacade } from './state/app.facade';
import { AppEffects } from './state/app.effects';
import { appReducer } from '@main/app.state';
import { AuthInterceptor } from './core/interceptor/authentication.interceptor';
import { UnAuthorizedInterceptor } from './core/interceptor/unauthorize.interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StorePublicModule } from './shared/store/store.module';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import { RecaptchaModule, RecaptchaFormsModule, RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    StoreModule.forRoot(appReducer),
    EffectsModule.forRoot([AppEffects]),
    StorePublicModule.forRoot(),
    // StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production })
    StoreDevtoolsModule.instrument({
      name: environment.NgRxName,
      maxAge: environment.NgRxMaxAge,
      logOnly: environment.isDebug
    }),
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    AppFacade,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UnAuthorizedInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
