import { of } from 'rxjs';
import { EmployerPanelComponent } from './employer-panel.component';

describe('EmployerPanelComponent session recovery', () => {
  it('clears an expired session locally and returns to employer sign-in', () => {
    localStorage.setItem('user', '{}');
    const core: any = {
      discardExpiredSession: jasmine.createSpy('discardExpiredSession'),
      logout: jasmine.createSpy('logout'),
    };
    const employeeFacade: any = { employeeDetails$: of(null), loading$: of(false) };
    const companyFacade: any = { companyDetails$: of(null) };
    const router: any = { navigate: jasmine.createSpy('navigate') };
    const component = new EmployerPanelComponent(
      core, employeeFacade, companyFacade, {} as any, {} as any, router, {} as any, {} as any,
    );

    component.signInAgain();

    expect(core.discardExpiredSession).toHaveBeenCalledTimes(1);
    expect(core.logout).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/signin'], { queryParams: { role: 2 } });
    localStorage.removeItem('user');
  });
});
