import { EmployerSubscriptionComponent } from './employer-subscription.component';

/**
 * B6 (FIND-01): the trial FAQ may say only what gh-be enforces. Its committed code (7613c06)
 * never unpublishes, pauses or hides a published job when a trial ends; plan limits gate only
 * new actions (A3, A3.1).
 */
describe('EmployerSubscriptionComponent -- the trial FAQ says what the backend does (B6)', () => {
  const OLD_ANSWER = 'When your free trial expires, your active job posts will be paused and you will lose access to paid features.';

  function trialAnswer(): string {
    const component = new EmployerSubscriptionComponent(
      {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any,
    );
    const item = ((component as any).faqItems as Array<{ q: string; a: string }>)
      .find(entry => entry.q === 'What happens when my free trial ends?');
    expect(item).withContext('trial FAQ entry missing').toBeDefined();
    return item!.a;
  }

  it('says published jobs stay published, and not that applications keep arriving (unconfirmed, B6.1)', () => {
    const answer = trialAnswer();
    expect(answer).toContain('published jobs stay published');
    expect(answer).not.toMatch(/keep receiving applications|applications keep|still arrive/i);
  });

  it('claims nothing is paused or deleted', () => {
    const PAUSED = /paus/i;
    expect(PAUSED.test(OLD_ANSWER)).withContext('control: the old answer').toBeTrue();
    const answer = trialAnswer();
    expect(PAUSED.test(answer)).toBeFalse();
    expect(answer).not.toMatch(/delet|remov|lose|lost/i);
  });

  it('names only the new actions a plan unlocks: publishing or reopening jobs, team members, screening questions', () => {
    const answer = trialAnswer();
    ['publish or reopen jobs', 'add team members', 'add screening questions', 'Choose a plan'].forEach(phrase =>
      expect(answer).withContext(phrase).toContain(phrase));
    expect(answer).not.toMatch(/applicant|cap|limit of/i);
  });
});
