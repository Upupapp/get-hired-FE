import { employerPlanLimitRefusal } from './plan-limit-refusal';
import { CANDIDATE_REFUSAL, EMPLOYER_REFUSAL, httpFailure } from '../../../testing/plan-limit-refusal.fixture';

describe('employerPlanLimitRefusal -- reading gh-be A3\'s refusal', () => {
  it('reads the employer refusal from its HTTP 402', () => {
    expect(employerPlanLimitRefusal(httpFailure(402, EMPLOYER_REFUSAL))).toEqual(EMPLOYER_REFUSAL);
  });

  it('ignores the same body on any other status, so those failures keep their own handling', () => {
    [400, 403, 409, 413, 422, 500].forEach(status =>
      expect(employerPlanLimitRefusal(httpFailure(status, EMPLOYER_REFUSAL))).withContext(String(status)).toBeNull());
  });

  it('never reads A3.1\'s candidate refusal as an employer one', () => {
    expect(employerPlanLimitRefusal(httpFailure(400, CANDIDATE_REFUSAL))).toBeNull();
    expect(employerPlanLimitRefusal(httpFailure(402, CANDIDATE_REFUSAL))).toBeNull();
  });

  it('ignores a 402 without the plan-limit body, and anything that is not an HTTP failure', () => {
    expect(employerPlanLimitRefusal(httpFailure(402, null))).toBeNull();
    expect(employerPlanLimitRefusal(httpFailure(402, 'Payment Required'))).toBeNull();
    expect(employerPlanLimitRefusal(httpFailure(402, { message: 'Payment Required' }))).toBeNull();
    expect(employerPlanLimitRefusal(null)).toBeNull();
    expect(employerPlanLimitRefusal(new Error('network down'))).toBeNull();
  });
});
