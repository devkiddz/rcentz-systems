import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const assets = ["preview.jpg", "handover.pdf"];
const expected = assets.map((name) =>
  createHash("sha256")
    .update(readFileSync("public/demo/dennis-portfolio/" + name))
    .digest("hex"),
);
const deadline = Date.now() + 6 * 60 * 1000;
let ready = false;
while (Date.now() < deadline) {
  try {
    const checks = await Promise.all(
      assets.map(async (name, index) => {
        const response = await fetch(
          "https://systems.rcentz.cc/demo/dennis-portfolio/" + name,
          { signal: AbortSignal.timeout(20000), cache: "no-store" },
        );
        if (!response.ok) return false;
        const checksum = createHash("sha256")
          .update(Buffer.from(await response.arrayBuffer()))
          .digest("hex");
        return checksum === expected[index];
      }),
    );
    if (checks.every(Boolean)) {
      ready = true;
      break;
    }
  } catch {
    /* A deployment may briefly be unavailable. */
  }
  console.log(
    "Waiting for Vercel to publish the portfolio preview and sample records...",
  );
  await new Promise((resolve) => setTimeout(resolve, 10000));
}
if (!ready) {
  console.error(
    "Live assets are not ready yet. Check the Vercel deployment, then rerun this installer. No seed was applied.",
  );
  process.exitCode = 1;
} else
  console.log("PASS: live preview and milestone records match this release.");
