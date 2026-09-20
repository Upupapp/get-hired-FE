import { EngagementTelemetryService } from './engagement-telemetry.service';
import { E2_STORAGE_90_OWNER } from '../../../testing/engagement-e2-code.fixture';
describe('Engagement presentation telemetry', () => {
  it('maps target plan and usage to the existing sink without carrying candidate data', () => {
    const sink = jasmine.createSpyObj('analytics', ['recordEvent']);
    const service = new EngagementTelemetryService(sink);
    service.record('storage_warning_impression', { ...E2_STORAGE_90_OWNER, candidate: {email: 'private@example.test'} } as any, 'dashboard');
    const properties = sink.recordEvent.calls.mostRecent().args[1];
    expect(properties.recommendedPlan).toBe(E2_STORAGE_90_OWNER.recommendation!.targetPlan);
    expect(properties.usagePercent).toBe(E2_STORAGE_90_OWNER.usage!.percentage);
    expect(Object.keys(properties).sort()).toEqual(['currentPlan', 'priority', 'recommendedPlan', 'ruleKey', 'surface', 'trigger', 'usagePercent'].sort());
    expect(JSON.stringify(properties)).not.toContain('private@example.test');
  });
});
