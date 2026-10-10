# Hunt settings release R1

New owner-only route: /admin/opportunities/settings. Existing career/profile references, experience, country, weekly-hours, relocation, web research and collection enablement move from the review page. Configure hunt links there; save revalidates both surfaces and returns to the fixed settings route with confirmation. Project reference desktop grid/mobile rail remains unchanged. The large legacy career text remains stored; omitted field preserves it.

Schedule, delivery and standard storage limits are informational. Retention enablement is not exposed by the current API and no cleanup runs here. Retention preview/control and daily digest remain subsequent phases, not completed by this release.

FinderWorkspace is replaced with clean UTF-8. Installer recognizes the precise prior release, including its unused-import cleanup, UTF-8 BOM and known Windows ANSI-decoding corruption variants. Other source edits cause preflight to stop before copying. Installer uses Node byte-preserving copies and does not rewrite through PowerShell text decoding. No API changes, migrations, environment updates, deployment, commit or push performed.

Verification: settings guard precedes fetching, existing bounded API contract, fixed redirect target, project/text preservation, bridge/detail/admin checks, TypeScript, lint and production build. No live browser visual verification. Deploy Systems only after installer verification, then Configure hunt: confirm existing values/references, save, refresh and verify persistence. On review page confirm restored Activity · Last 30 days, Source health · Last 30 days and em-dash display. Settings stays internal, never a client tool.
