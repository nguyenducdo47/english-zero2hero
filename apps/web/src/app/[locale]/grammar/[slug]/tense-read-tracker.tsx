"use client";

import { useEffect } from "react";
import { markTenseComplete } from "@/lib/progress";

export function TenseReadTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const t = setTimeout(() => markTenseComplete(slug), 2000);
    return () => clearTimeout(t);
  }, [slug]);

  return null;
}
