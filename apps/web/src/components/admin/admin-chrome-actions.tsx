"use client";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/** Locale + theme controls styled for admin shell (--admin-* tokens). */
export function AdminChromeActions({ className }: Props) {
  return (
    <div className={cn("flex shrink-0 items-center gap-1", className)}>
      <LocaleSwitcher surface="admin" />
      <ThemeToggle surface="admin" />
    </div>
  );
}
