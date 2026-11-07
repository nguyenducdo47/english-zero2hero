const KEY = "e2h_grammar_progress";

export type GrammarProgress = {
  completedTenses: string[];
  completedGroups: string[];
};

const defaultProgress: GrammarProgress = {
  completedTenses: [],
  completedGroups: [],
};

export function readProgress(): GrammarProgress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProgress;
    return { ...defaultProgress, ...JSON.parse(raw) };
  } catch {
    return defaultProgress;
  }
}

export function writeProgress(progress: GrammarProgress) {
  localStorage.setItem(KEY, JSON.stringify(progress));
}

export function markTenseComplete(slug: string) {
  const p = readProgress();
  if (!p.completedTenses.includes(slug)) {
    p.completedTenses.push(slug);
    writeProgress(p);
  }
}

export function markGroupComplete(slug: string) {
  const p = readProgress();
  if (!p.completedGroups.includes(slug)) {
    p.completedGroups.push(slug);
    writeProgress(p);
  }
}
