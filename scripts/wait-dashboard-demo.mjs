const expected = "rcentz-project-preview-order-v2-20261008";
const deadline = Date.now() + 6 * 60 * 1000;
let ready = false;
while (Date.now() < deadline) {
  try {
    const response = await fetch(
      "https://systems.rcentz.cc/demo/dennis-portfolio/dashboard-release.json?t=" +
        Date.now(),
      {
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
        redirect: "error",
      },
    );
    if (response.ok && (await response.json()).release === expected) {
      ready = true;
      break;
    }
  } catch {
    /* Deployment may not have finished yet. */
  }
  console.log("Waiting for the updated dashboard deployment…");
  await new Promise((resolve) => setTimeout(resolve, 10000));
}
if (!ready) {
  console.error(
    "The updated deployment is not published yet. Check Vercel and rerun the installer. No demo expansion was attempted.",
  );
  process.exitCode = 1;
} else console.log("PASS: updated dashboard release is published.");
