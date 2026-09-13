import { EngagementContext, EngagementPriority, Nudge } from './engagement-contract.models';
import { MessageActionOutcome } from './subscription-engagement.service';

/**
 * How a backend message looks and behaves once rendered (F2). The backend decides what a message says,
 * how urgent it is and whether it can be dismissed; these rules only turn that into the design system,
 * and are shared by the shell banner and the card.
 */

export type MessageTone = 'critical' | 'high' | 'warning' | 'notice' | 'info';

export interface PriorityPresentation {
  /** Shown beside the colour and the icon: colour is never the only signal (contract §7.1). */
  label: string;
  tone: MessageTone;
  /** HIGH and CRITICAL are announced to assistive technology (role="alert"). */
  urgent: boolean;
}

export const PRIORITY_PRESENTATION: Record<EngagementPriority, PriorityPresentation> = {
  CRITICAL: { label: 'Critical', tone: 'critical', urgent: true },
  HIGH: { label: 'Important', tone: 'high', urgent: true },
  WARNING: { label: 'Warning', tone: 'warning', urgent: false },
  NOTICE: { label: 'Notice', tone: 'notice', urgent: false },
  INFO: { label: 'For your information', tone: 'info', urgent: false },
};

export function priorityPresentation(priority: EngagementPriority | null | undefined): PriorityPresentation {
  return (priority && PRIORITY_PRESENTATION[priority]) || PRIORITY_PRESENTATION.INFO;
}

/**
 * One message per major surface (contract §7.2): the banner when there is one, otherwise the card.
 * The backend already never sets both; this keeps a page from showing two if it ever did.
 */
export function majorSurfaces(context: EngagementContext | null): { banner: Nudge | null; card: Nudge | null } {
  const banner = context && context.banner ? context.banner : null;
  const card = !banner && context && context.dashboardCard ? context.dashboardCard : null;
  return { banner, card };
}

/**
 * Whether to go to an action's url once its click has been posted. A 4xx refusal (400 INVALID_INTENT:
 * this viewer is not offered that action) goes nowhere. A 5xx or no answer means only that the click
 * could not be recorded (503 NOTIFICATIONS_UNAVAILABLE until the migrations run, contract §11), and the
 * destination is a route that exists, so the viewer still gets there.
 */
export function navigatesAfterClick(outcome: MessageActionOutcome): boolean {
  if (outcome.outcome !== 'refused') { return true; }
  return outcome.httpStatus === 0 || outcome.httpStatus >= 500;
}

/** A dismissal that was refused (409 NOT_DISMISSIBLE, or the store unavailable) leaves the message in place. */
export function hidesAfterDismiss(outcome: MessageActionOutcome): boolean {
  return outcome.outcome !== 'refused';
}
