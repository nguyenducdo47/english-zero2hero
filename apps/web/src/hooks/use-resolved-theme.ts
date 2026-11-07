"use client";

import { useSyncExternalStore } from "react";
import {
  getResolvedThemeServerSnapshot,
  readResolvedTheme,
  subscribeResolvedTheme,
  type ResolvedTheme,
} from "@/lib/theme-storage";

export function useResolvedTheme(): ResolvedTheme {
  return useSyncExternalStore(
    subscribeResolvedTheme,
    readResolvedTheme,
    getResolvedThemeServerSnapshot,
  );
}
