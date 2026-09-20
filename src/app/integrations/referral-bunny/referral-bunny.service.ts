import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { environment } from '@environments/environment';
@Injectable({providedIn:'root'})
export class ReferralBunnyService {
  private base = environment.api_url + '/integrations/referral-bunny';
  private started = false;
  private captureBusy = false;
  private claimBusy = false;
  private lastAttempt = '';
  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platform: object) {}
  init(): void {
    if (this.started || !isPlatformBrowser(this.platform)) return;
    this.started = true;
    this.visit();
    this.router.events.subscribe(event => { if (event instanceof NavigationEnd) this.visit(); });
  }
  private visit(): void {
    try {
      const pending = JSON.parse(sessionStorage.getItem('rb-connect-return') || 'null');
      if (pending && pending.expires > Date.now() && localStorage.getItem('state') === 'true' && !location.pathname.startsWith('/integrations/referral-bunny')) {
        sessionStorage.removeItem('rb-connect-return');
        if (/^[a-f0-9]{64}$/.test(pending.request)) this.router.navigate(['/integrations/referral-bunny'], {queryParams:{request:pending.request}});
      }
      const params = new URLSearchParams(location.search);
      const programId = params.get('rb_program'), membershipId = params.get('rb_ref');
      const saved = JSON.parse(localStorage.getItem('rb-referral') || 'null');
      if (programId && membershipId && !this.captureBusy && this.lastAttempt !== programId+':'+membershipId && !(saved && saved.programId===programId && saved.membershipId===membershipId && saved.expiresAt>Date.now())) {
        this.lastAttempt = programId+':'+membershipId; this.captureBusy = true;
        this.http.post<any>(this.base+'/capture',{programId,membershipId}).subscribe({next: data => {
          this.captureBusy=false;
          try { localStorage.setItem('rb-referral',JSON.stringify({...data,programId,membershipId})); } catch (_) {}
          this.claim();
        }, error: () => { this.captureBusy=false; }});
      }
      this.claim();
    } catch (_) { /* Storage restrictions must not break the website. */ }
  }
  private claim(): void {
    try {
      const saved = JSON.parse(localStorage.getItem('rb-referral') || 'null');
      if (!saved || saved.expiresAt<=Date.now() || this.claimBusy || this.captureBusy || localStorage.getItem('state')!=='true' || localStorage.getItem('role')!=='2') return;
      this.claimBusy=true;
      this.http.post(this.base+'/claim',{receipt:saved.receipt}).subscribe({next:()=>{localStorage.removeItem('rb-referral');this.claimBusy=false;},error:e=>{
        this.claimBusy=false;
        if ([400,409,410].includes(e.status)) localStorage.removeItem('rb-referral');
      }});
    } catch (_) {}
  }
  details(request: string) { return this.http.get<any>(this.base+'/requests/'+encodeURIComponent(request)); }
  approve(request: string, approved: boolean) { return this.http.post<any>(this.base+'/requests/'+encodeURIComponent(request)+'/approve',{approved}); }
}
