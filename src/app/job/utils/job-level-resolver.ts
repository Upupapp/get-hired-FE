export type LevelMatchConfidence = 'high' | 'medium' | 'none';

export interface LevelOption {
  id: number;
  name: string;
}

export interface LevelMatchResult {
  id: number | null;
  confidence: LevelMatchConfidence;
  matchedName?: string;
}

const SENIORITY_BUCKETS: { [bucket: string]: string[] } = {
  entry: ['entry', 'entry level', 'junior', 'jr', 'fresh grad', 'fresh graduate', 'fresher', 'no experience', 'trainee', 'intern'],
  mid: ['mid', 'mid level', 'mid-level', 'intermediate', 'associate'],
  senior: ['senior', 'sr', 'expert', 'specialist'],
  lead: ['lead', 'team lead', 'supervisor', 'principal'],
  manager: ['manager', 'head of', 'director', 'vp', 'vice president', 'executive', 'chief', 'c-level'],
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Matches a free-text AI-generated seniority hint (e.g. "Senior", "5+ years, team lead")
 * against the live, backend-owned job level list. Job levels aren't a fixed FE enum like
 * work setup/employment type, so this never hardcodes an id — only English synonym words
 * used to search whatever the caller's currently-loaded options happen to contain.
 */
export function resolveJobLevelId(hint: string | null | undefined, levels: LevelOption[]): LevelMatchResult {
  if (!hint || !levels || !levels.length) {
    return { id: null, confidence: 'none' };
  }

  const h = normalize(hint);
  if (!h) {
    return { id: null, confidence: 'none' };
  }

  for (const lvl of levels) {
    if (normalize(lvl.name) === h) {
      return { id: lvl.id, confidence: 'high', matchedName: lvl.name };
    }
  }

  for (const lvl of levels) {
    const n = normalize(lvl.name);
    if (n.length > 2 && (h.includes(n) || n.includes(h))) {
      return { id: lvl.id, confidence: 'high', matchedName: lvl.name };
    }
  }

  let bucket: string | null = null;
  for (const [b, words] of Object.entries(SENIORITY_BUCKETS)) {
    if (words.some((w) => h.includes(w))) {
      bucket = b;
      break;
    }
  }
  if (!bucket) {
    const yearsMatch = h.match(/(\d+)\+?\s*year/);
    if (yearsMatch) {
      const yrs = parseInt(yearsMatch[1], 10);
      bucket = yrs >= 8 ? 'manager' : yrs >= 5 ? 'senior' : yrs >= 2 ? 'mid' : 'entry';
    }
  }

  if (bucket) {
    for (const lvl of levels) {
      const n = normalize(lvl.name);
      if (SENIORITY_BUCKETS[bucket].some((w) => n.includes(w))) {
        return { id: lvl.id, confidence: 'medium', matchedName: lvl.name };
      }
    }
  }

  return { id: null, confidence: 'none' };
}
