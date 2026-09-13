import { of, throwError } from 'rxjs';
import { EngagementRefreshBus } from '@main/shared/engagement/engagement-refresh.bus';
import { CompanyUsersComponent } from './company-users.component';

/** F1: removing a team member changes the seat meter, so the engagement context is read again. */
describe('CompanyUsersComponent -- removing a team member reads the engagement context again (F1)', () => {
  const member = { uid: 'U-2', fullName: 'Team Member' } as any;

  function build(removal: any): { component: CompanyUsersComponent; bus: EngagementRefreshBus; companyService: any } {
    const bus = new EngagementRefreshBus();
    spyOn(bus, 'request');
    const dialog = { open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(1) }) };
    const companyService = { removeCompanyUser: jasmine.createSpy('removeCompanyUser').and.returnValue(removal) };
    const facade: any = { users$: of([]), getCompanyUsers: jasmine.createSpy('getCompanyUsers') };
    const component = new CompanyUsersComponent(facade, companyService as any, dialog as any,
      jasmine.createSpyObj('Router', ['navigate']), {} as any, jasmine.createSpyObj('SnackbarService', ['success', 'error']), bus);
    component.companyId = 'CO-1';
    return { component, bus, companyService };
  }

  it('the member was removed: one refresh request', () => {
    const { component, bus, companyService } = build(of({}));
    component.removeMember(member);
    expect(companyService.removeCompanyUser).toHaveBeenCalledWith('U-2', 'CO-1');
    expect((bus.request as jasmine.Spy).calls.allArgs()).toEqual([['member_removed']]);
  });

  it('the removal failed: no refresh request', () => {
    const { component, bus } = build(throwError(() => ({ status: 500, error: { message: 'Something went wrong.' } })));
    component.removeMember(member);
    expect(bus.request).not.toHaveBeenCalled();
  });
});
