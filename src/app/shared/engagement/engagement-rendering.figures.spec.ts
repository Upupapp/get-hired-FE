import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { SubscriptionStatusBannerComponent } from '@main/employer-panel/employer-subscription/components/subscription-status-banner/subscription-status-banner.component';
import { UpgradePromptCardComponent } from '@main/employer-panel/employer-subscription/components/upgrade-prompt-card/upgrade-prompt-card.component';
import { ENGAGEMENT_CONTEXT_RESPONSE, NUDGE } from '../../../testing/engagement-contract.fixture';
import {
  E2_JOBS_80_OWNER, E2_STORAGE_90_OWNER, E2_STORAGE_FULL_OWNER, E2_STORAGE_FULL_TEAM_ADMIN,
} from '../../../testing/engagement-e2-code.fixture';
import { Nudge } from './engagement-contract.models';

/** Contract §7.8: never render undefined, NaN or "null GB". */
const MISSING = /undefined|NaN|null GB|\bnull\b|\[object Object\]/;

const context = ENGAGEMENT_CONTEXT_RESPONSE.context;
const MESSAGES: Array<[string, Nudge]> = [
  ['contract context prominent', context.prominent!],
  ...context.secondary.map((n): [string, Nudge] => [`contract context secondary ${n.id}`, n]),
  ['contract context dashboardCard', context.dashboardCard!],
  ['contract Nudge', NUDGE],
  ['gh-be storage.full, owner', E2_STORAGE_FULL_OWNER],
  ['gh-be storage.full, team admin', E2_STORAGE_FULL_TEAM_ADMIN],
  ['gh-be storage.90, owner', E2_STORAGE_90_OWNER],
  ['gh-be jobs.80, owner', E2_JOBS_80_OWNER],
];

describe('Every served message renders with no missing figure (F2)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubscriptionStatusBannerComponent, UpgradePromptCardComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true), navigate: () => Promise.resolve(true), events: EMPTY, url: '/recruiter/dashboard', navigated: true } }],
    });
  });

  function renderedText(type: typeof SubscriptionStatusBannerComponent | typeof UpgradePromptCardComponent, message: Nudge): string {
    const fixture = TestBed.createComponent<SubscriptionStatusBannerComponent | UpgradePromptCardComponent>(type);
    fixture.componentInstance.message = JSON.parse(JSON.stringify(message));
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const labels = Array.from(root.querySelectorAll('[aria-label]')).map(e => e.getAttribute('aria-label'));
    const text = [root.textContent, ...labels].join(' ').replace(/\s+/g, ' ');
    fixture.destroy();
    return text;
  }

  it('the check is not blind: a message with missing figures is caught in both components', () => {
    const planted: Nudge = { ...NUDGE, copy: { ...NUDGE.copy, body: "You've used null GB of undefined (NaN%)." } };
    expect(MISSING.test(renderedText(SubscriptionStatusBannerComponent, planted))).toBeTrue();
    expect(MISSING.test(renderedText(UpgradePromptCardComponent, planted))).toBeTrue();
  });

  it(`all ${MESSAGES.length} messages, in the banner and in the card, show their title and nothing missing`, () => {
    MESSAGES.forEach(([where, message]) => {
      [SubscriptionStatusBannerComponent, UpgradePromptCardComponent].forEach(type => {
        const text = renderedText(type, message);
        expect(text).withContext(`${where} in ${type.name}`).toContain(message.copy.title);
        expect(MISSING.test(text)).withContext(`${where} in ${type.name}: ${text}`).toBeFalse();
      });
    });
  });
});
