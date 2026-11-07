import {
  emitStoreChange,
  listenStorageKey,
  listenWindowEvent,
} from "@/lib/store-sync";

export const GRAMMAR_PROGRESS_KEY = "e2h_grammar_progress";

export const GRAMMAR_PROGRESS_EVENT = "e2h:grammar-progress";

const KEY = GRAMMAR_PROGRESS_KEY;

export type GrammarProgress = {
  completedTenses: string[];
  completedGroups: string[];
};

/** Cùng tham chiếu cho getServerSnapshot + trạng thái rỗng. */
export const GRAMMAR_PROGRESS_SERVER_SNAPSHOT: GrammarProgress = {
  completedTenses: [],
  completedGroups: [],
};

let clientSnapshot: GrammarProgress = GRAMMAR_PROGRESS_SERVER_SNAPSHOT;
let clientSnapshotKey = JSON.stringify(GRAMMAR_PROGRESS_SERVER_SNAPSHOT);

function computeProgress(): GrammarProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return GRAMMAR_PROGRESS_SERVER_SNAPSHOT;
    const parsed = JSON.parse(raw) as Partial<GrammarProgress>;
    return {
      completedTenses: [...(parsed.completedTenses ?? [])],
      completedGroups: [...(parsed.completedGroups ?? [])],
    };
  } catch {
    return GRAMMAR_PROGRESS_SERVER_SNAPSHOT;
  }
}

export function readProgress(): GrammarProgress {
  if (typeof window === "undefined") return GRAMMAR_PROGRESS_SERVER_SNAPSHOT;
  const next = computeProgress();
  if (next === GRAMMAR_PROGRESS_SERVER_SNAPSHOT) return GRAMMAR_PROGRESS_SERVER_SNAPSHOT;
  const key = JSON.stringify(next);
  if (key === clientSnapshotKey) return clientSnapshot;
  clientSnapshotKey = key;
  clientSnapshot = next;
  return clientSnapshot;
}

export function writeProgress(progress: GrammarProgress) {
  const normalized: GrammarProgress = {
    completedTenses: [...progress.completedTenses],
    completedGroups: [...progress.completedGroups],
  };
  localStorage.setItem(KEY, JSON.stringify(normalized));
  clientSnapshotKey = JSON.stringify(normalized);
  clientSnapshot = normalized;
  emitStoreChange(GRAMMAR_PROGRESS_EVENT);
}

export function subscribeGrammarProgress(onStoreChange: () => void): () => void {
  const unSub = listenStorageKey(GRAMMAR_PROGRESS_KEY, onStoreChange);
  const unEv = listenWindowEvent(GRAMMAR_PROGRESS_EVENT, onStoreChange);
  return () => {
    unSub();
    unEv();
  };
}

export function getGrammarProgressServerSnapshot(): GrammarProgress {
  return GRAMMAR_PROGRESS_SERVER_SNAPSHOT;
}

export function markTenseComplete(slug: string) {
  const p = readProgress();
  if (!p.completedTenses.includes(slug)) {
    writeProgress({
      ...p,
      completedTenses: [...p.completedTenses, slug],
    });
  }
}

export function markGroupComplete(slug: string) {
  const p = readProgress();
  if (!p.completedGroups.includes(slug)) {
    writeProgress({
      ...p,
      completedGroups: [...p.completedGroups, slug],
    });
  }
}
