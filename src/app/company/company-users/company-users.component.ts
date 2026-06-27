import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { CompanyFacade } from '@app-company/state/company.facade';
import { ImportAddUserComponent } from './dialogs/import-add-user.component/import-add-user.component';
import { SubscriptionAlertComponent } from '@app-shared/components/subscription-alert/subscription-alert.component';
import { mainAnimations } from '@main/shared/animations/main-animations';
import * as Model from '../company.model';

@Component({
  selector: 'app-company-users',
  templateUrl: './company-users.component.html',
  styleUrls: ['./company-users.component.scss'],
  animations: [mainAnimations]
})
export class CompanyUsersComponent implements OnInit, OnDestroy {
  @Input() companyId: string;

  subscriptions$ = new Subscription();
  private unsubscribe$ = new Subject<void>();

  users$ = this.companyFacade.users$;
  loading = true;
  currentUserUid = '';

  constructor(
    private companyFacade: CompanyFacade,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.companyFacade.getCompanyUsers(this.companyId);

    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        this.currentUserUid = u._id || u.id || u.uid || '';
      }
    } catch (_) {}

    setTimeout(() => this.loading = false, 1500);
  }

  getInitials(fullName: string): string {
    if (!fullName) { return '?'; }
    const parts = fullName.trim().split(' ');
    const first = (parts[0] || '').charAt(0).toUpperCase();
    const last = (parts[1] || '').charAt(0).toUpperCase();
    return first + last || first;
  }

  openProfile(member: Model.CompanyUser): void {
    if (member.uid && member.uid === this.currentUserUid) {
      this.router.navigate(['/recruiter/company/settings'], { queryParams: { tab: 4 } });
    }
    // read-only view for other members: no-op in V1 (no profile drawer yet)
  }

  addAccess(): void {
    this.companyFacade.getCompanySubscription(this.companyId);
    this.companyFacade.subsRestrictions$.pipe(
      filter(subs => !!subs),
      take(1),
      takeUntil(this.unsubscribe$)
    ).subscribe(subs => this.checkSubs(subs));
  }

  checkSubs(subs: Model.CompanySubscriptions): void {
    if (subs) {
      if (subs.adminCount === subs.admin) {
        this.restrictUserCreation();
      } else {
        this.addUserToCompany();
      }
    }
  }

  restrictUserCreation(): void {
    const ref = this.dialog.open(SubscriptionAlertComponent, {
      width: '34vw',
      data: { isError: true }
    });
    this.subscriptions$.add(
      ref.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe(result => {
        if (result === 1) {
          this.router.navigate(['../../subscription'], { relativeTo: this.route });
        }
      })
    );
  }

  addUserToCompany(): void {
    this.dialog.open(ImportAddUserComponent, {
      width: '34vw',
      maxWidth: '100vw',
      maxHeight: '90vh',
    });
  }

  ngOnDestroy(): void {
    this.subscriptions$.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
