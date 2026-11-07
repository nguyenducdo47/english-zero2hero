"use client";

import { useEffect } from "react";
import { markTenseComplete } from "@/lib/progress";
import { recordStudyActivity, writeLearningStats } from "@/lib/learning-stats";

export function TenseReadTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const t = setTimeout(() => {
      markTenseComplete(slug);
      const stats = recordStudyActivity(15);
      if (!stats.completedTenses.includes(slug)) {
        writeLearningStats({
          ...stats,
          completedTenses: [...stats.completedTenses, slug],
        });
      }
    }, 2000);
    return () => clearTimeout(t);
  }, [slug]);

  return null;
}
