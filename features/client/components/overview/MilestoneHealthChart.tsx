"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type MilestoneHealthChartProps = {
  completed: number;
  active: number;
  remaining: number;
  total: number;
  segments?: string[];
  compact?: boolean;
};

type MilestoneChartDatum = {
  name: string;
  value: number;
  fill: string;
};

export function MilestoneHealthChart({
  completed,
  active,
  remaining,
  total,
  segments,
  compact = false,
}: MilestoneHealthChartProps) {
  const completion = total > 0 ? Math.round((completed / total) * 100) : 0;

  const palette = ["#5aaea0", "#719bcc", "#9a8cc7", "#7daf96"];
  const milestoneData: MilestoneChartDatum[] = [
    ...(segments?.length === completed && completed > 0
      ? segments.map((name, index) => ({
          name,
          value: 1,
          fill: palette[index % palette.length],
        }))
      : [{ name: "Completed", value: completed, fill: palette[0] }]),
    {
      name: "Active",
      value: active,
      fill: "var(--chart-warning)",
    },
    {
      name: "Remaining",
      value: remaining,
      fill: "var(--border-strong)",
    },
  ].filter((item) => item.value > 0);

  const hasMilestones = total > 0;

  return (
    <div
      className={
        compact ? "flex flex-col p-4 sm:p-5" : "flex h-full flex-col p-4 sm:p-5"
      }
    >
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Project progress
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Overall milestone completion
        </p>
      </div>

      <div
        className={
          compact
            ? "mt-4 flex flex-col items-center gap-3"
            : "mt-5 flex flex-1 items-center gap-5"
        }
      >
        <div className="relative size-28 shrink-0">
          {hasMilestones ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={milestoneData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={43}
                    outerRadius={52}
                    paddingAngle={3}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {milestoneData.map((item) => (
                      <Cell key={item.name} fill={item.fill} />
                    ))}
                  </Pie>

                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      color: "var(--foreground)",
                      fontSize: "12px",
                      boxShadow: "0 10px 30px rgb(0 0 0 / 0.16)",
                    }}
                    itemStyle={{
                      color: "var(--foreground)",
                    }}
                    labelStyle={{
                      color: "var(--muted-foreground)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-semibold tabular-nums text-foreground">
                  {completion}%
                </span>

                <span className="text-[10px] text-muted-foreground">
                  complete
                </span>
              </div>
            </>
          ) : (
            <div className="flex size-full items-center justify-center rounded-full border border-dashed border-border">
              <span className="text-xs text-muted-foreground">No data</span>
            </div>
          )}
        </div>

        <div
          className={compact ? "w-full space-y-2" : "min-w-0 flex-1 space-y-3"}
        >
          <MilestoneLegend
            label="Completed"
            value={`${completed}/${total}`}
            indicatorClassName="bg-[#5aaea0]"
          />

          {!compact || active > 0 ? (
            <MilestoneLegend
              label="Active"
              value={String(active)}
              indicatorClassName="bg-[var(--chart-warning)]"
            />
          ) : null}

          {!compact || remaining > 0 ? (
            <MilestoneLegend
              label="Remaining"
              value={String(remaining)}
              indicatorClassName="bg-border-strong"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MilestoneLegend({
  label,
  value,
  indicatorClassName,
}: {
  label: string;
  value: string;
  indicatorClassName: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={["size-2 shrink-0 rounded-full", indicatorClassName].join(
            " ",
          )}
        />

        <span className="truncate text-xs text-muted-foreground">{label}</span>
      </div>

      <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}
