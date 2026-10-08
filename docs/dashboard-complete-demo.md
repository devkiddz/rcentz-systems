# Dashboard preview and completed Dennis demonstration

The project page now presents the latest screenshot, application access and a thin multicolour milestone donut in three desktop columns. Small screens use a readable stacked layout. Delivery checklist, completed reviews/support and a six-day performance summary sit directly below the preview. Full Website Intelligence follows Project Funding. The green antenna links to the published application; it does not claim continuous uptime monitoring.

Support chat reads and saves messages in an existing active project conversation. Only the project owner with an active conversation membership can read or send. It refreshes while open, checks the request origin and message size, and limits bursts. No automatic response or staff online presence is fabricated. If a conversation has not been opened by the team, email support is shown instead. The team can reply through its existing conversation tooling; this release does not create an admin messaging interface.

## Demo expansion

Requires Dennis's original private demo, reserved slug `demo-dennis-portfolio-complete-v1`, owned by `denngodfirst@gmail.com`, and the original seed notice. No account/password changes or schema migrations.

- Accepted sample website quote: NGN 750,000.
- Three paid sample invoices: NGN 300,000 discovery/design; NGN 300,000 development; NGN 150,000 launch/handover.
- Three successful **simulated MANUAL** payments, with DEMO references, explicit metadata and matching invoice balances. No gateway, bank, charge or email action.
- Three accepted billing reviews supplement the original seven milestone reviews.
- Existing deliverables, tasks, PDFs, conversations, support history, onboarding and screenshot remain intact.
- Six days of labelled synthetic page views/sessions/actions. Collection is PAUSED with no allowed origins; no real traffic or visitor identities are asserted.

This is a service order represented by its converted brief, accepted quote and project invoices. No unrelated digital-product order is fabricated. The sample ledger is visible to this demo account and may appear in administrative billing reports; DEMO identifiers and metadata distinguish it from real receipts.

The transaction is atomic. Repeated execution preserves its records and later edits. It refuses an unrelated quote, non-demo billing, previously edited budget/analytics before the first expansion, or conflicting reserved identifiers. If live verification fails after saving, rerun safely; do not reset the database.

## Installation

Run the packaged PowerShell installer from the repository. It creates a recovery branch, installs the bundle, runs lint/build and read-only checks, pushes to `systems/main`, waits for the deployment marker, then verifies Dennis's live login before adding the simulated records. Enter the current account password only at the hidden prompt. Configure production credentials locally through DATABASE_URL; no secrets are included in the package.

## Verification

Production build and targeted lint passed. An isolated PostgreSQL-compatible fixture verified rollback, idempotence, matched ledger balances, ownership guards and credential preservation. Authenticated production-server checks covered login, project rendering, saved chat messages, anonymous/foreign-owner refusal, origin/body checks and burst limiting. Browser checks at 1440, 768 and 390 pixels covered light/dark layouts, no horizontal overflow, actual send success and Escape closing. No production database writes were performed while preparing this package.
