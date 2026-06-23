export interface ProfileQualityResult {
  score: number; // 0-100
  label: 'Excellent' | 'Good' | 'Needs Work' | 'Just Started';
  missingFields: string[];
  suggestions: string[];
}
