"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Timer } from "lucide-react";

type Props = {
  endsAtIso: string;
  startedAtIso: string;
  onExpire?: () => void;
  className?: string;
};

function formatRemaining(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function ExamCountdown({ endsAtIso, startedAtIso, onExpire, className }: Props) {
  const t = useTranslations("mock");
  const endsAt = new Date(endsAtIso).getTime();
  const startedAt = new Date(startedAtIso).getTime();
  const totalMs = Math.max(1, endsAt - startedAt);

  const [now, setNow] = useState(() => Date.now());
  const remaining = endsAt - now;
  const pct = Math.min(100, Math.max(0, ((totalMs - remaining) / totalMs) * 100));
  const expired = remaining <= 0;
  const warn = !expired && remaining < 5 * 60 * 1000;

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const expiredFired = useRef(false);
  useEffect(() => {
    if (expired && !expiredFired.current) {
      expiredFired.current = true;
      onExpire?.();
    }
  }, [expired, onExpire]);

  return (
    <div
      className={cn(
        "sticky top-[3.25rem] z-30 rounded-lg border bg-background/95 p-3 shadow-sm backdrop-blur",
        warn && "border-warning/60",
        expired && "border-destructive/50",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Timer className={cn("size-4", warn && "text-warning", expired && "text-destructive")} aria-hidden />
          {expired ? t("timeUp") : t("timeRemaining", { time: formatRemaining(remaining) })}
        </div>
        <Badge variant={expired ? "destructive" : warn ? "outline" : "secondary"}>
          {expired ? t("timeUpBadge") : t("timedMode")}
        </Badge>
      </div>
      <Progress value={pct} className="mt-2 h-1.5" />
    </div>
  );
}
