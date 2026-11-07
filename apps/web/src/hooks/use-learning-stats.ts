"use client";

import { useSyncExternalStore } from "react";
import {
  getLearningStatsServerSnapshot,
  readLearningStats,
  subscribeLearningStats,
  type LearningStats,
} from "@/lib/learning-stats";

export function useLearningStats(): LearningStats {
  return useSyncExternalStore(
    subscribeLearningStats,
    readLearningStats,
    getLearningStatsServerSnapshot,
  );
}
