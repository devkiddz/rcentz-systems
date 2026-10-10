"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FinderAnalytics } from "../types";
export function FinderCharts({ daily }: { daily: FinderAnalytics["daily"] }) {
  return (
    <div
      className="h-56 w-full"
      role="img"
      aria-label="Daily discoveries and recorded application events over the past 30 days. Exact totals are shown above."
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={daily}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="day"
            tickFormatter={(v) => String(v).slice(5)}
            minTickGap={40}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            width={32}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              color: "var(--card-foreground)",
              borderColor: "var(--border)",
              borderRadius: "var(--radius)",
            }}
          />
          <Area
            name="Discovered"
            dataKey="discovered"
            stroke="var(--primary)"
            fill="var(--primary)"
            fillOpacity={0.12}
          />
          <Area
            name="Application events"
            dataKey="applied"
            stroke="var(--foreground)"
            fill="var(--foreground)"
            fillOpacity={0.04}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
