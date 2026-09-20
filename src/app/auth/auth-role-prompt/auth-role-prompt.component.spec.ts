import { AuthRolePromptComponent } from './auth-role-prompt.component';

describe('AuthRolePromptComponent', () => {
  it('requires a choice on every new component instance', () => {
    expect(new AuthRolePromptComponent().visible).toBeTrue();
    expect(new AuthRolePromptComponent().visible).toBeTrue();
  });

  it('emits the employer role and closes the prompt', () => {
    const component = new AuthRolePromptComponent();
    const selected: number[] = [];
    component.roleSelected.subscribe((role) => selected.push(role));

    component.choose(2);

    expect(selected).toEqual([2]);
    expect(component.visible).toBeFalse();
  });

  it('emits the job-seeker role and uses flow-specific copy', () => {
    const component = new AuthRolePromptComponent();
    const selected: number[] = [];
    component.flow = 'signup';
    component.roleSelected.subscribe((role) => selected.push(role));

    component.choose(3);

    expect(selected).toEqual([3]);
    expect(component.actionLabel).toBe('Create your account');
  });
});
