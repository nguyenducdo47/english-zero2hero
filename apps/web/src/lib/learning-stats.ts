import { TENSE_SLUGS_BY_ORDER } from "@/lib/grammar-slugs";
import {
  GRAMMAR_PROGRESS_EVENT,
  GRAMMAR_PROGRESS_KEY,
  readProgress,
  writeProgress,
  type GrammarProgress,
} from "@/lib/progress";
import { emitStoreChange, listenWindowEvent } from "@/lib/store-sync";

export const LEARNING_STATS_KEY = "e2h_learning_stats_v1";

export const LEARNING_STATS_EVENT = "e2h:learning-stats";

const STATS_KEY = LEARNING_STATS_KEY;

export type LearningStats = GrammarProgress & {
  xp: number;
  streakDays: number;
  lastStudyDate: string | null;
  dailyGoalMinutes: number;
};

/** Bắt buộc cùng tham chiếu cho getServerSnapshot (React useSyncExternalStore). */
export const LEARNING_STATS_SERVER_SNAPSHOT: LearningStats = {
  completedTenses: [],
  completedGroups: [],
  xp: 0,
  streakDays: 0,
  lastStudyDate: null,
  dailyGoalMinutes: 15,
};

let clientSnapshot: LearningStats = LEARNING_STATS_SERVER_SNAPSHOT;
let clientSnapshotKey = JSON.stringify(LEARNING_STATS_SERVER_SNAPSHOT);

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function mergeFromLegacyProgress(stats: LearningStats): LearningStats {
  const legacy = readProgress();
  return {
    ...stats,
    completedTenses: [
      ...new Set([...stats.completedTenses, ...legacy.completedTenses]),
    ],
    completedGroups: [
      ...new Set([...stats.completedGroups, ...legacy.completedGroups]),
    ],
  };
}

function computeLearningStats(): LearningStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    const base: LearningStats = raw
      ? {
          ...LEARNING_STATS_SERVER_SNAPSHOT,
          ...(JSON.parse(raw) as Partial<LearningStats>),
        }
      : { ...LEARNING_STATS_SERVER_SNAPSHOT };
    return mergeFromLegacyProgress(base);
  } catch {
    return mergeFromLegacyProgress({ ...LEARNING_STATS_SERVER_SNAPSHOT });
  }
}

export function readLearningStats(): LearningStats {
  if (typeof window === "undefined") return LEARNING_STATS_SERVER_SNAPSHOT;
  const next = computeLearningStats();
  const key = JSON.stringify(next);
  if (key === clientSnapshotKey) return clientSnapshot;
  clientSnapshotKey = key;
  clientSnapshot = next;
  return clientSnapshot;
}

export function writeLearningStats(stats: LearningStats) {
  const normalized: LearningStats = {
    ...stats,
    completedTenses: [...stats.completedTenses],
    completedGroups: [...stats.completedGroups],
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(normalized));
  writeProgress({
    completedTenses: normalized.completedTenses,
    completedGroups: normalized.completedGroups,
  });
  clientSnapshotKey = JSON.stringify(normalized);
  clientSnapshot = normalized;
  emitStoreChange(LEARNING_STATS_EVENT);
}

export function subscribeLearningStats(onStoreChange: () => void): () => void {
  const keys = [STATS_KEY, GRAMMAR_PROGRESS_KEY];
  const onStorage = (e: StorageEvent) => {
    if (e.key && keys.includes(e.key)) onStoreChange();
    if (e.key === null) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  const unStats = listenWindowEvent(LEARNING_STATS_EVENT, onStoreChange);
  const unGrammar = listenWindowEvent(GRAMMAR_PROGRESS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    unStats();
    unGrammar();
  };
}

export function getLearningStatsServerSnapshot(): LearningStats {
  return LEARNING_STATS_SERVER_SNAPSHOT;
}

/** Gọi khi học xong một hoạt động (đọc thì, quiz…). */
export function recordStudyActivity(xpGain = 10) {
  const stats = { ...readLearningStats() };
  const today = todayIso();
  if (stats.lastStudyDate === today) {
    stats.xp += xpGain;
    writeLearningStats(stats);
    return stats;
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yIso = yesterday.toISOString().slice(0, 10);
  if (stats.lastStudyDate === yIso) {
    stats.streakDays += 1;
  } else {
    stats.streakDays = 1;
  }
  stats.lastStudyDate = today;
  stats.xp += xpGain;
  writeLearningStats(stats);
  return stats;
}

export function suggestNextTenseSlug(stats?: LearningStats): string | null {
  const s = stats ?? readLearningStats();
  const next = TENSE_SLUGS_BY_ORDER.find((slug) => !s.completedTenses.includes(slug));
  return next ?? TENSE_SLUGS_BY_ORDER[0] ?? null;
}
