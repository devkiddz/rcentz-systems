/* Rcentz first-party project analytics. No query strings, form values or persistent visitor IDs. */
(() => {
  "use strict";
  if (
    window.__rcentzTracker ||
    navigator.doNotTrack === "1" ||
    navigator.globalPrivacyControl
  )
    return;
  const script = document.currentScript;
  const base =
    script?.getAttribute("data-collector") || "https://systems.rcentz.cc";
  const site = script?.getAttribute("data-site");
  if (!site || location.origin !== site) return; // Production site only; previews and localhost are excluded.
  window.__rcentzTracker = true;
  const pending = [];
  let referrerHost = "direct";
  try {
    const host = document.referrer ? new URL(document.referrer).hostname : "";
    if (host && host !== location.hostname) referrerHost = host;
  } catch {
    /* No valid referring site. */
  }
  let key = "",
    session = "",
    ready = false;
  let storageAvailable = true;
  function newSession() {
    return crypto.randomUUID();
  }
  function touchSession() {
    const now = Date.now();
    try {
      const stored = JSON.parse(
        sessionStorage.getItem("rcentz-session:" + site) || "null",
      );
      session =
        stored && now - stored.last < 30 * 60 * 1000 ? stored.id : newSession();
      sessionStorage.setItem(
        "rcentz-session:" + site,
        JSON.stringify({ id: session, last: now }),
      );
    } catch {
      if (storageAvailable || !session) session = newSession();
      storageAvailable = false;
    }
    return session;
  }
  async function deliver(event) {
    const payload = JSON.stringify({ ...event, trackingKey: key });
    try {
      // No auth cookies are sent to the collector.
      await fetch(base + "/api/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        credentials: "omit",
        keepalive: true,
      });
    } catch {
      /* Analytics never interrupts the application. */
    }
  }
  function track(type, action) {
    if (
      document.visibilityState === "prerender" ||
      /^(\/login|\/register|\/dashboard|\/api|\/start-project)(\/|$)/.test(
        location.pathname,
      )
    )
      return;
    const event = {
      type,
      action,
      ...(type === "PAGE_VIEW" ? { referrerHost } : {}),
      eventId: crypto.randomUUID(),
      sessionKey: touchSession(),
      path: location.pathname.slice(0, 512),
    };
    if (ready) void deliver(event);
    else if (pending.length < 20) pending.push(event);
  }
  let path = location.pathname;
  function route() {
    if (path !== location.pathname) {
      path = location.pathname;
      track("PAGE_VIEW");
    }
  }
  for (const method of ["pushState", "replaceState"]) {
    const original = history[method];
    history[method] = function (...args) {
      const result = original.apply(this, args);
      route();
      return result;
    };
  }
  addEventListener("popstate", route);
  document.addEventListener(
    "click",
    (event) => {
      const element =
        event.target instanceof Element
          ? event.target.closest("a,button,[data-rcentz-action]")
          : null;
      if (!element || element.closest("form,input,textarea,[contenteditable]"))
        return;
      const action = element.getAttribute("data-rcentz-action");
      track(
        "CLICK",
        action && /^[a-zA-Z0-9_-]{1,48}$/.test(action) ? action : undefined,
      );
    },
    { passive: true },
  );
  track("PAGE_VIEW");
  async function connect(attempt = 0) {
    try {
      const response = await fetch(base + "/api/analytics/config", {
        credentials: "omit",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("paused");
      const data = await response.json();
      if (typeof data.trackingKey !== "string") return;
      key = data.trackingKey;
      ready = true;
      for (const event of pending.splice(0)) void deliver(event);
    } catch {
      if (attempt < 3)
        setTimeout(() => connect(attempt + 1), 5000 * (attempt + 1));
    }
  }
  void connect();
})();
