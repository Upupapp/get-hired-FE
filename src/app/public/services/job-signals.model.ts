export type JobBadgeId =
  | 'new' | 'posted-today' | 'posted-this-week' | 'closing-soon'
  | 'remote' | 'hybrid' | 'onsite'
  | 'salary-shown' | 'video-interview' | 'company-profile';

export interface JobSignalBadge {
  id: JobBadgeId;
  label: string;
}

export interface JobSignals {
  primaryBadges: JobSignalBadge[];
  secondaryBadges: JobSignalBadge[];
  freshnessLabel: string | null;
  trustIndicators: string[];
  warnings: string[];
  isExpired: boolean;
  isClosed: boolean;
  isActive: boolean;
  /** Higher = show first in default/recommended sort. */
  displayPriority: number;
}
