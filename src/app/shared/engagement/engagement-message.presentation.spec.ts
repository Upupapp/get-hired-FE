import { ENGAGEMENT_CONTEXT_RESPONSE } from '../../../testing/engagement-contract.fixture';
import { E2_PLACED_WITH_BANNER, E2_STORAGE_90_OWNER, E2_STORAGE_FULL_OWNER } from '../../../testing/engagement-e2-code.fixture';
import { EngagementContext, EngagementPriority } from './engagement-contract.models';
import {
  PRIORITY_PRESENTATION, hidesAfterDismiss, majorSurfaces, navigatesAfterClick, priorityPresentation,
} from './engagement-message.presentation';

describe('Engagement message presentation (F2)', () => {
  it('every priority has its own label and tone, and only HIGH and CRITICAL are announced as alerts', () => {
    const priorities: EngagementPriority[] = ['INFO', 'NOTICE', 'WARNING', 'HIGH', 'CRITICAL'];
    expect(new Set(priorities.map(p => PRIORITY_PRESENTATION[p].label)).size).toBe(5);
    expect(new Set(priorities.map(p => PRIORITY_PRESENTATION[p].tone)).size).toBe(5);
    expect(priorities.every(p => PRIORITY_PRESENTATION[p].label.trim().length > 0)).toBeTrue();
    expect(priorities.filter(p => PRIORITY_PRESENTATION[p].urgent)).toEqual(['HIGH', 'CRITICAL']);
    expect(priorityPresentation(null)).toBe(PRIORITY_PRESENTATION.INFO);
  });

  it('a banner and a card never come out together: the banner wins, even from a context that carried both', () => {
    const served: EngagementContext = { ...ENGAGEMENT_CONTEXT_RESPONSE.context, ...E2_PLACED_WITH_BANNER };
    expect(majorSurfaces(served)).toEqual({ banner: E2_STORAGE_FULL_OWNER, card: null });
    expect(majorSurfaces({ ...served, dashboardCard: E2_STORAGE_90_OWNER })).toEqual({ banner: E2_STORAGE_FULL_OWNER, card: null });
    const contract = ENGAGEMENT_CONTEXT_RESPONSE.context;
    expect(majorSurfaces(contract)).toEqual({ banner: null, card: contract.dashboardCard });
    expect(majorSurfaces(null)).toEqual({ banner: null, card: null });
  });

  it('after a click: a 4xx refusal goes nowhere; an answer, a 5xx or no answer goes to the url', () => {
    expect(navigatesAfterClick({ outcome: 'applied', status: 'CLICKED' })).toBeTrue();
    expect(navigatesAfterClick({ outcome: 'not_found' })).toBeTrue();
    expect(navigatesAfterClick({ outcome: 'refused', httpStatus: 400, code: 'INVALID_INTENT', message: null })).toBeFalse();
    expect(navigatesAfterClick({ outcome: 'refused', httpStatus: 409, code: 'NOT_DISMISSIBLE', message: null })).toBeFalse();
    expect(navigatesAfterClick({ outcome: 'refused', httpStatus: 503, code: 'NOTIFICATIONS_UNAVAILABLE', message: null })).toBeTrue();
    expect(navigatesAfterClick({ outcome: 'refused', httpStatus: 0, code: null, message: null })).toBeTrue();
  });

  it('after a dismiss: any refusal leaves the message in place', () => {
    expect(hidesAfterDismiss({ outcome: 'applied', status: 'DISMISSED' })).toBeTrue();
    expect(hidesAfterDismiss({ outcome: 'not_found' })).toBeTrue();
    expect(hidesAfterDismiss({ outcome: 'refused', httpStatus: 409, code: 'NOT_DISMISSIBLE', message: 'x' })).toBeFalse();
    expect(hidesAfterDismiss({ outcome: 'refused', httpStatus: 503, code: 'NOTIFICATIONS_UNAVAILABLE', message: null })).toBeFalse();
  });
});
