"use client";

import { useLayoutEffect } from "react";
import { applyThemeClass, readResolvedTheme } from "@/lib/theme-storage";

/** Áp class `dark` sớm trên client (mỗi lần layout locale mount, vd. đổi ngôn ngữ). */
export function ThemeInit() {
  useLayoutEffect(() => {
    applyThemeClass(readResolvedTheme());
  }, []);

  return null;
}
