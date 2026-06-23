import {
  MatchFactorEvidence,
  MatchRequiredBlocker,
  MatchDataUsed,
  MatchDataNotUsed,
  MatchFactorSummary,
  MatchFactorUiHints,
} from './match-factor.model';

export type CompatibilityLabel = 'Excellent Match' | 'Strong Match' | 'Good Potential' | 'Partial Match' | 'Low Match';

export type ConfidenceLabel = 'High Confidence' | 'Medium Confidence' | 'Low Confidence' | 'Limited Data';

export interface CompatibilityFactor {
  key: string;
  label: string;
  matched: boolean;
  weight: number;
}

export interface JobCompatibilityResult {
  score: number; // 0-100
  label: CompatibilityLabel;
  /** Legacy field, unchanged shape (string[]), per MATCH FACTORS v2's
   * compatibility rule -- derived from matchedFactorEvidence via
   * match-factor-adapter.ts, not computed separately. Existing consumers
   * (JobMatchPanelComponent, RecommendedJobsComponent) keep working
   * unmodified. */
  matchedFactors: string[];
  /** Legacy field, unchanged shape -- see matchedFactors above. */
  missingFactors: string[];
  suggestions: string[];
  explanation: string;
  /** MATCH v3 -- how much reliable data existed to evaluate, separate from
   * the score itself (see GETHIRED_MATCH_V3_SCORING_MODEL.md Layer 4). */
  confidence: number; // 0-100
  confidenceLabel: ConfidenceLabel;

  // ── MATCH FACTORS v2 -- structured evidence, additive, optional-safe ──
  // All consumers written before this pass continue to work without
  // reading any of these. New/updated consumers may use them; if absent,
  // UI must show "Detailed evidence unavailable" rather than crash (see
  // GETHIRED_MATCH_FACTOR_UI_PLACEMENT_SPEC.md).
  matchedFactorEvidence?: MatchFactorEvidence[];
  missingFactorEvidence?: MatchFactorEvidence[];
  transferableFactorEvidence?: MatchFactorEvidence[];
  unclearFactorEvidence?: MatchFactorEvidence[];
  blockedFactorEvidence?: MatchFactorEvidence[];
  requiredBlockers?: MatchRequiredBlocker[];
  dataUsed?: MatchDataUsed[];
  dataNotUsed?: MatchDataNotUsed[];
  factorSummary?: MatchFactorSummary;
  factorUiHints?: MatchFactorUiHints;
}
