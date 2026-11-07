"use client";

import { useEffect, useState } from "react";
import { readProgress } from "@/lib/progress";

export function ProgressSummary() {
  const [counts, setCounts] = useState({ tenses: 0, groups: 0 });

  useEffect(() => {
    const p = readProgress();
    setCounts({
      tenses: p.completedTenses.length,
      groups: p.completedGroups.length,
    });
  }, []);

  return (
    <p className="text-sm text-slate-600">
      Tiến độ local: {counts.tenses}/12 thì · {counts.groups}/4 nhóm quiz
    </p>
  );
}
