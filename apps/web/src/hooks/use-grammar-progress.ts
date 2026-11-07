"use client";

import { useSyncExternalStore } from "react";
import {
  getGrammarProgressServerSnapshot,
  readProgress,
  subscribeGrammarProgress,
  type GrammarProgress,
} from "@/lib/progress";

export function useGrammarProgress(): GrammarProgress {
  return useSyncExternalStore(
    subscribeGrammarProgress,
    readProgress,
    getGrammarProgressServerSnapshot,
  );
}
