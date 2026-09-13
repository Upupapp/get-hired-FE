import { of } from 'rxjs';
import { CompanyUsersComponent } from './company-users.component';
import { ImportAddUserComponent } from './dialogs/import-add-user.component/import-add-user.component';
import { SubscriptionAlertComponent } from '@app-shared/components/subscription-alert/subscription-alert.component';
import { EngagementRefreshBus } from '@main/shared/engagement/engagement-refresh.bus';

/**
 * B5.1: "Add team member". No seat pre-check on the client: the invite dialog opens, its request
 * reaches POST /company/addcompanyuser, and a 402 there opens the limit dialog (pinned in
 * import-add-user.plan-limit.spec.ts).
 */
describe('CompanyUsersComponent -- "Add team member" has no client-side seat gate (B5.1)', () => {
  it('opens the invite dialog where the old check saw every seat taken, without asking for or reading restrictions', () => {
    const dialog = { open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(undefined) }) };
    const restrictionsRead = jasmine.createSpy('subsRestrictions$').and.returnValue(of({ admin: 2, adminCount: 2 }));
    const facade: any = {
      users$: of([]),
      getCompanyUsers: jasmine.createSpy('getCompanyUsers'),
      getCompanySubscription: jasmine.createSpy('getCompanySubscription'),
    };
    Object.defineProperty(facade, 'subsRestrictions$', { get: restrictionsRead });
    const component = new CompanyUsersComponent(facade, {} as any, dialog as any,
      jasmine.createSpyObj('Router', ['navigate']), {} as any, jasmine.createSpyObj('SnackbarService', ['success', 'error']), new EngagementRefreshBus());
    component.companyId = 'CO-1';

    component.addAccess();

    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(dialog.open.calls.mostRecent().args[0]).toBe(ImportAddUserComponent);
    expect(dialog.open.calls.allArgs().filter((args: any[]) => args[0] === SubscriptionAlertComponent)).toEqual([]);
    expect(facade.getCompanySubscription).not.toHaveBeenCalled();
    expect(restrictionsRead).not.toHaveBeenCalled();
  });
});
