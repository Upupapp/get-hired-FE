export type ApplicationReadinessState =
  | 'ready' | 'almost_ready' | 'needs_profile_update'
  | 'missing_required_documents' | 'video_answer_required' | 'incomplete_application';

export interface ApplicationReadinessResult {
  state: ApplicationReadinessState;
  label: string;
  description: string;
  /** Reasons displayed to the user — always supportive copy, never blaming. */
  reasons: string[];
  /** True only when the job/backend genuinely requires something missing — low match never blocks. */
  blocksApply: boolean;
  ctaLabel: string;
}
