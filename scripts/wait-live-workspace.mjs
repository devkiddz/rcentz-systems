const site =
  process.argv[2] === "portfolio"
    ? "https://dennis.rcentz.cc"
    : "https://systems.rcentz.cc";
const deadline = Date.now() + 6 * 60 * 1000;
let ready = false;
while (Date.now() < deadline) {
  try {
    const response = await fetch(
      site + "/live-workspace-release.json?t=" + Date.now(),
      {
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
        redirect: "error",
      },
    );
    if (
      response.ok &&
      (await response.json()).release === "rcentz-live-workspace-v1-20261008"
    ) {
      ready = true;
      break;
    }
  } catch {
    /* Wait for production deployment. */
  }
  console.log("Waiting for deployment: " + site);
  await new Promise((resolve) => setTimeout(resolve, 10000));
}
if (!ready) {
  console.error(
    "Deployment is not published yet. Check Vercel, then rerun this installer.",
  );
  process.exitCode = 1;
} else console.log("PASS: release is live on " + site);
