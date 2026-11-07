"use client";

import { useSyncExternalStore } from "react";
import {
  getAuthTokenServerSnapshot,
  getStoredToken,
  subscribeAuthToken,
} from "@/lib/api";

export function useAuthToken(): string | null {
  return useSyncExternalStore(
    subscribeAuthToken,
    getStoredToken,
    getAuthTokenServerSnapshot,
  );
}
