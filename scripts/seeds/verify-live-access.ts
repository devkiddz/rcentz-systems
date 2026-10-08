import { EMAIL, SeedGuardError } from "./dennis-portfolio";
const origin = "https://systems.rcentz.cc";
export async function verifyLiveAccess(
  password: string,
  projectId: string,
  requestId: string | null,
) {
  const login = await fetch(origin + "/api/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({ email: EMAIL, password }),
    signal: AbortSignal.timeout(30000),
    redirect: "error",
  });
  if (!login.ok)
    throw new SeedGuardError(
      "The demo was saved, but live login failed. Check production auth/database settings. The password was not reset.",
    );
  const cookie = login.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  if (!cookie)
    throw new SeedGuardError(
      "Live login returned no session cookie. The demo was saved; verify the production auth configuration.",
    );
  try {
    const project = await fetch(origin + "/dashboard/projects/" + projectId, {
      headers: { Cookie: cookie },
      signal: AbortSignal.timeout(30000),
      redirect: "error",
    });
    const html = await project.text();
    if (
      !project.ok ||
      !html.includes("Dennis Jones") ||
      !html.includes("Portfolio Website")
    )
      throw new SeedGuardError(
        "The account was saved, but its project did not appear on the live dashboard. Confirm local DATABASE_URL and Vercel DATABASE_URL point to the same database.",
      );
    for (const route of [
      "/dashboard",
      "/dashboard/files",
      "/dashboard/messages",
      ...(requestId ? ["/dashboard/onboarding/" + requestId] : []),
    ]) {
      const response = await fetch(origin + route, {
        headers: { Cookie: cookie },
        signal: AbortSignal.timeout(30000),
        redirect: "error",
      });
      if (!response.ok)
        throw new SeedGuardError(
          "The demo was saved, but the live " +
            route +
            " page failed. Check Vercel runtime logs; do not reset the account.",
        );
    }
    console.log(
      "PASS: live login, project detail, overview, files, messages and saved onboarding.",
    );
  } finally {
    await fetch(origin + "/api/auth/sign-out", {
      method: "POST",
      headers: {
        Cookie: cookie,
        Origin: origin,
        "Content-Type": "application/json",
      },
      body: "{}",
      signal: AbortSignal.timeout(20000),
    }).catch(() => undefined);
  }
}
