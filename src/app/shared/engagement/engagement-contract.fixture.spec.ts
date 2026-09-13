import {
  BELL_LIST_RESPONSE, CONTRACT_CANDIDATE_REFUSAL, CONTRACT_EMPLOYER_LIMIT_REFUSAL, ENGAGEMENT_CONTEXT_RESPONSE,
  LIST_QUERY_ERROR, MESSAGE_ACTION_ERROR, MESSAGE_ACTION_NOT_FOUND, MESSAGE_ACTION_RESPONSE, NOTIFICATION_ITEM,
  NOTIFICATION_LIST_RESPONSE, NUDGE,
} from '../../../testing/engagement-contract.fixture';
import { JOB_NOT_ACCEPTING_APPLICATIONS } from '@main/shared/plan-limit/plan-limit-refusal';

/**
 * F1: the contract's tagged examples, typed. Compiling this file is most of the proof; a field removed
 * from a fixture or from its type fails the build. These specs pin the relations the contract states
 * between the examples, so a regenerated fixture that broke them would show.
 */
describe('The E2 contract examples, typed against the frontend models (F1)', () => {
  it('every tagged example is present', () => {
    expect([
      ENGAGEMENT_CONTEXT_RESPONSE, NUDGE, NOTIFICATION_LIST_RESPONSE, NOTIFICATION_ITEM, MESSAGE_ACTION_RESPONSE,
      MESSAGE_ACTION_NOT_FOUND, MESSAGE_ACTION_ERROR, LIST_QUERY_ERROR, BELL_LIST_RESPONSE,
      CONTRACT_EMPLOYER_LIMIT_REFUSAL, CONTRACT_CANDIDATE_REFUSAL,
    ].every(example => !!example)).toBeTrue();
  });

  it('the context sets at most one of banner and dashboardCard, and it is one of the ranked messages', () => {
    const context = ENGAGEMENT_CONTEXT_RESPONSE.context;
    expect(context.banner && context.dashboardCard).toBeFalsy();
    const ranked = [context.prominent, ...context.secondary].filter(n => !!n).map(n => n!.id);
    expect(ranked).toContain(context.dashboardCard!.id);
  });

  it('notification ids are strings, and found: false carries no status', () => {
    expect(NOTIFICATION_LIST_RESPONSE.notifications.map(n => typeof n.id)).toEqual(['string', 'string']);
    expect(Object.keys(MESSAGE_ACTION_NOT_FOUND)).toEqual(['success', 'found']);
  });

  it('the candidate refusal is the A3.1 code with exactly five keys', () => {
    expect(CONTRACT_CANDIDATE_REFUSAL.code).toBe(JOB_NOT_ACCEPTING_APPLICATIONS);
    expect(Object.keys(CONTRACT_CANDIDATE_REFUSAL).length).toBe(5);
  });
});
