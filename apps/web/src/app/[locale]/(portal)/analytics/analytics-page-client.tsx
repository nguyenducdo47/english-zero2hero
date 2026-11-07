"use client";

import dynamic from "next/dynamic";

const AnalyticsCharts = dynamic(
  () =>
    import("@/components/learning/analytics-charts").then((m) => m.AnalyticsCharts),
  {
    ssr: false,
    loading: () => <div className="h-72 animate-pulse rounded-lg bg-muted" aria-busy />,
  },
);

type Props = {
  tenseLabel: string;
  groupLabel: string;
  groupNames: string[];
};

export function AnalyticsPageClient(props: Props) {
  return <AnalyticsCharts {...props} />;
}
