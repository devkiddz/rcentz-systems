import dotenv from "dotenv";
import pg from "pg";
dotenv.config({ path: [".env.local", ".env"], quiet: true });
const origin = "https://dennis.rcentz.cc";
const config = await fetch("https://systems.rcentz.cc/api/analytics/config", {
  headers: { Origin: origin },
});
if (!config.ok)
  throw new Error(
    "Live collector is not ready. Wait for Systems deployment, then retry.",
  );
const html = await fetch(origin, { cache: "no-store" }).then((r) => r.text());
const script = await fetch(origin + "/rcentz-analytics.js", {
  cache: "no-store",
}).then((r) => r.text());
if (
  !html.includes("rcentz-analytics.js") ||
  (!script.includes("RCENTZ") && !script.includes("rcentzTracker")) ||
  !script.includes("/api/analytics/events")
)
  throw new Error("Portfolio tracker deployment is not ready.");
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});
try {
  const result = await pool.query(
    `SELECT c.status, c."lastIngestedAt", c."lastAggregatedAt", COALESCE(a."pageViews",0) AS views FROM "Project" p JOIN "ProjectAnalyticsConfig" c ON c."projectId"=p.id LEFT JOIN "ProjectAnalytics" a ON a."projectId"=p.id WHERE p.slug=$1`,
    ["demo-dennis-portfolio-complete-v1"],
  );
  if (!result.rows[0] || result.rows[0].status !== "ACTIVE")
    throw new Error("Database tracker is not active.");
  console.log("PASS: portfolio script and live collector deployed.");
  console.log(
    result.rows[0].lastIngestedAt
      ? `Real collection received events. Page views: ${result.rows[0].views}.`
      : "No event received yet. Open dennis.rcentz.cc in a browser, browse a page, then run this check again. Privacy opt-out/ad blockers may exclude that browser.",
  );
} finally {
  await pool.end();
}
