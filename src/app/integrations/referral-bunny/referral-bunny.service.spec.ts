import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { ReferralBunnyService } from './referral-bunny.service';
import { environment } from '@environments/environment';
describe('Referral Bunny automatic connection and attribution',()=>{
 let service:ReferralBunnyService,http:HttpTestingController,events:Subject<any>,router:any;
 const base=environment.api_url+'/integrations/referral-bunny';
 let original:string;
 beforeEach(()=>{
  original=location.pathname+location.search;localStorage.clear();sessionStorage.clear();
  events=new Subject();router={events,navigate:jasmine.createSpy('navigate')};
  TestBed.configureTestingModule({imports:[HttpClientTestingModule],providers:[ReferralBunnyService,{provide:Router,useValue:router}]});
  service=TestBed.inject(ReferralBunnyService);http=TestBed.inject(HttpTestingController);
 });
 afterEach(()=>{http.verify();history.replaceState({},'',original);localStorage.clear();sessionStorage.clear();});
 it('does not make connector requests on ordinary visits',()=>{history.replaceState({},'','/home');service.init();http.expectNone(r=>r.url.includes('/referral-bunny'));});
 it('captures a referral before login and claims it automatically for a new employer session',()=>{
  history.replaceState({},'','/home?rb_program=p&rb_ref=m');service.init();
  const capture=http.expectOne(base+'/capture');expect(capture.request.body).toEqual({programId:'p',membershipId:'m'});capture.flush({receipt:'opaque',expiresAt:Date.now()+60000});
  localStorage.setItem('state','true');localStorage.setItem('role','2');history.replaceState({},'','/recruiter/dashboard');events.next(new NavigationEnd(1,'/recruiter/dashboard','/recruiter/dashboard'));
  const claim=http.expectOne(base+'/claim');expect(claim.request.body).toEqual({receipt:'opaque'});claim.flush({attributed:true});expect(localStorage.getItem('rb-referral')).toBeNull();
 });
 it('returns to the exact saved approval request after sign in',()=>{
  history.replaceState({},'','/admin');const request='a'.repeat(64);sessionStorage.setItem('rb-connect-return',JSON.stringify({request,expires:Date.now()+60000}));localStorage.setItem('state','true');service.init();
  expect(router.navigate).toHaveBeenCalledWith(['/integrations/referral-bunny'],{queryParams:{request}});expect(sessionStorage.getItem('rb-connect-return')).toBeNull();
 });
 it('preserves a receipt on temporary errors and removes it for an ineligible existing customer',()=>{
  history.replaceState({},'','/recruiter/dashboard');localStorage.setItem('state','true');localStorage.setItem('role','2');localStorage.setItem('rb-referral',JSON.stringify({receipt:'opaque',expiresAt:Date.now()+60000}));service.init();
  http.expectOne(base+'/claim').flush({}, {status:503,statusText:'Unavailable'});expect(localStorage.getItem('rb-referral')).not.toBeNull();
  events.next(new NavigationEnd(2,'/recruiter/dashboard','/recruiter/dashboard'));http.expectOne(base+'/claim').flush({}, {status:409,statusText:'Conflict'});expect(localStorage.getItem('rb-referral')).toBeNull();
 });
 it('does not attribute job seeker or admin accounts',()=>{
  history.replaceState({},'','/user/dashboard');localStorage.setItem('state','true');localStorage.setItem('role','3');localStorage.setItem('rb-referral',JSON.stringify({receipt:'opaque',expiresAt:Date.now()+60000}));service.init();http.expectNone(base+'/claim');
 });
});
