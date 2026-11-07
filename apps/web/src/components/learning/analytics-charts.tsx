"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TENSE_COUNT } from "@/lib/grammar-slugs";
import { useLearningStats } from "@/hooks/use-learning-stats";

type Props = {
  tenseLabel: string;
  groupLabel: string;
  groupNames: string[];
};

export function AnalyticsCharts({ tenseLabel, groupLabel, groupNames }: Props) {
  const stats = useLearningStats();

  const tensePct = Math.round((stats.completedTenses.length / TENSE_COUNT) * 100);
  const data = [
    { name: tenseLabel, value: tensePct, raw: stats.completedTenses.length },
    ...groupNames.map((name, i) => ({
      name,
      value: stats.completedGroups.length > i ? 100 : 0,
      raw: stats.completedGroups.length > i ? 1 : 0,
    })),
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
          <Tooltip
            labelFormatter={(label) => String(label)}
            formatter={(value, _name, item) => {
              const payload = (item as { payload?: { raw?: number; name: string } })?.payload;
              if (!payload) return [String(value ?? 0), ""];
              if (payload.name === tenseLabel) {
                return [`${payload.raw ?? 0} / ${TENSE_COUNT}`, tenseLabel];
              }
              return [payload.raw ? groupLabel : "—", payload.name];
            }}
          />
          <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} name="%" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
