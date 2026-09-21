import {Component, NgModule, Injectable} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {HttpClientModule, HTTP_INTERCEPTORS, HttpInterceptor, HttpRequest, HttpHandler} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {of} from 'rxjs';
import {EmployerSubscriptionModule} from '../../src/app/employer-panel/employer-subscription/employer-subscription.module';
import {CompanyFacade} from '../../src/app/company/state/company.facade';
import {environment} from '../../src/environments/environment';

if(!['localhost','127.0.0.1'].includes(location.hostname))throw new Error('Local stage only');
environment.api_url='/api';
const scenario=new URLSearchParams(location.search).get('scenario')==='trial'?'trial':'internal';
@Injectable()
class LocalIdentity implements HttpInterceptor {
 intercept(req:HttpRequest<any>,next:HttpHandler){
  const url=new URL(req.url,location.href);
  if(url.origin!==location.origin)throw new Error('External requests disabled in local stage');
  return next.handle(req.clone({setHeaders:{'x-stage-case':scenario}}));
 }
}
@Component({selector:'app-root',template:`<header style="padding:16px;background:#fff4cf;color:#332900"><strong>LOCAL STAGING · Synthetic accounts · Simulated payments</strong><br><a href="/?scenario=internal">Internal company</a> · <a href="/?scenario=trial">Ordinary trial</a></header><router-outlet></router-outlet>`})
class StageRoot {}
@NgModule({declarations:[StageRoot],imports:[BrowserModule,BrowserAnimationsModule,HttpClientModule,RouterModule.forRoot([]),EmployerSubscriptionModule],providers:[{provide:CompanyFacade,useValue:{companyDetails$:of({companyName:'Synthetic staging company'})}},{provide:HTTP_INTERCEPTORS,useClass:LocalIdentity,multi:true}],bootstrap:[StageRoot]})
class StageModule {}
platformBrowserDynamic().bootstrapModule(StageModule).catch(console.error);
