export interface DocumentQualityResult {
  score: number; // 0-100
  label: 'Ready' | 'Almost Ready' | 'Needs Documents';
  hasResume: boolean;
  hasVideoCV: boolean;
  documentCount: number;
  missingFields: string[];
  suggestions: string[];
}
