import { Component, NgModule, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../../core/services/core.service';
import { ReferralBunnyService } from './referral-bunny.service';
@Component({selector:'app-referral-bunny-connect',template:`
<main class="rb-connect"><section>
  <p class="eyebrow">GETHIRED + REFERRAL BUNNY</p>
  <h1>Connect GetHired</h1>
  <p>Approve access to connect GetHired’s referral program. No code or API keys needed.</p>
  <p *ngIf="loading" role="status">Checking your account…</p>
  <p *ngIf="error" role="alert">{{error}}</p>
  <button *ngIf="needsLogin" (click)="signIn()">Sign in to GetHired</button>
  <button *ngIf="wrongAccount" (click)="switchAccount()" [disabled]="busy">Sign in with an administrator account</button>
  <p><a href="https://referralbunny.ai" (click)="clearReturn()">Return to Referral Bunny</a></p>
  <ng-container *ngIf="details">
    <div class="summary"><strong>{{details.programName}}</strong><p>Managed by {{details.businessName}} in Referral Bunny</p><p>Account: {{details.accountName}}</p></div>
    <p>This connection can remember referral visits and attribute new employer accounts. Existing accounts are not eligible.</p>
    <p *ngIf="details.paymentTracking">You also authorize GetHired to send verified subscription payments to this program for reward tracking. This includes eligible first payments and renewals; storage add-ons and upgrades are excluded.</p>
    <p class="note" *ngIf="!details.paymentTracking">Payment tracking is not enabled for this connection request.</p>
    <p class="note" *ngIf="details.refundTracking">Verified full and partial refunds also adjust the associated referral reward.</p>
    <p class="note" *ngIf="!details.refundTracking">Refund synchronization is not enabled for this connection.</p>
    <p class="note">Rewards require manual review; this approval does not initiate payouts.</p>
    <div class="actions"><button (click)="approve(true)" [disabled]="busy">{{busy ? 'Please wait…' : 'Approve connection'}}</button><button class="secondary" (click)="approve(false)" [disabled]="busy">Cancel</button></div>
  </ng-container>
</section></main>`,styles:[`
.rb-connect{min-height:70vh;background:#f5f4fc;padding:64px 20px;display:flex;justify-content:center;align-items:flex-start}.rb-connect section{max-width:560px;width:100%;padding:36px;background:white;border:1px solid #e7e2f3;border-radius:24px;color:#20213a}.eyebrow{font-size:12px;color:#7431cb;font-weight:700;letter-spacing:1px}h1{font-size:30px;margin:18px 0}p{line-height:1.6}.summary{background:#f6f2ff;border-radius:12px;padding:20px;margin:24px 0}.summary p{margin:6px 0}.note{font-size:13px;color:#65657a}.actions{display:flex;gap:12px;margin-top:24px}button{border:0;border-radius:10px;padding:12px 18px;background:#7429ce;color:white;font-weight:600;cursor:pointer}button.secondary{background:#f0edf5;color:#474158}button:disabled{opacity:.6;cursor:wait}[role=alert]{color:#ac213c}@media(max-width:480px){.rb-connect section{padding:24px}.actions{flex-direction:column}}
`]})
export class ReferralBunnyConnectComponent implements OnInit {
  request=''; details:any=null; loading=true; busy=false; error=''; needsLogin=false; wrongAccount=false;
  constructor(private api:ReferralBunnyService,private route:ActivatedRoute,private router:Router,private core:CoreService,@Inject(PLATFORM_ID) private platform:object){}
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platform)) return;
    this.request=this.route.snapshot.queryParamMap.get('request') || '';
    if(!/^[a-f0-9]{64}$/.test(this.request)){this.loading=false;this.error='Start the connection from your program in Referral Bunny.';return;}
    this.rememberReturn();
    if(localStorage.getItem('state')!=='true'){this.loading=false;this.needsLogin=true;return;}
    this.api.details(this.request).subscribe({next:data=>{this.details=data;this.loading=false;this.clearReturn();},error:e=>{this.loading=false;this.needsLogin=e.status===401;this.wrongAccount=e.status===403;if(e.status!==401)this.clearReturn();this.error=e.status===403?'Only a GetHired platform administrator can connect GetHired’s referral program.':e.status===410?'This connection request expired. Return to Referral Bunny and connect again.':'Unable to verify your account. Please sign in or try again.';}});
  }
  rememberReturn(): void {try{sessionStorage.setItem('rb-connect-return',JSON.stringify({request:this.request,expires:Date.now()+600000}));}catch(_){} }
  clearReturn(): void {try{sessionStorage.removeItem('rb-connect-return');}catch(_){} }
  signIn(): void {this.rememberReturn();this.router.navigateByUrl('/signin');}
  switchAccount(): void {if(this.busy)return;this.busy=true;this.rememberReturn();this.core.logout().subscribe(()=>this.router.navigateByUrl('/signin'));}
  approve(allowed:boolean): void {
    if(this.busy)return;this.busy=true;this.error='';
    this.api.approve(this.request,allowed).subscribe({next:data=>{
      let url:URL;
      try { url=new URL(data.redirect); } catch (_) {this.error="Unexpected callback address. Return to Referral Bunny.";this.busy=false;return;}
      if(url.origin!=='https://referralbunny.ai'||!/^\/tenant\/[a-zA-Z0-9_-]+\/quick-program\/connection\/[a-zA-Z0-9_-]+\/gethired\/callback$/.test(url.pathname)){this.error='Unexpected callback address. Return to Referral Bunny.';this.busy=false;return;}
      this.clearReturn();this.navigateToCallback(url.href);
    },error:e=>{this.busy=false;this.error=e.status===410?'Request expired. Start again in Referral Bunny.':e.status===409?'This request was already approved. Return to Referral Bunny and check the connection, or start again.':'Could not approve the connection. Return to Referral Bunny and try again.';}});
  }
  navigateToCallback(url:string):void {window.location.assign(url);}
}
@NgModule({declarations:[ReferralBunnyConnectComponent],imports:[CommonModule,RouterModule.forChild([{path:'',component:ReferralBunnyConnectComponent}])]})
export class ReferralBunnyModule {}
