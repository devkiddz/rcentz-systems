# Service selection and project onboarding — 16 October 2026

## Client flow

Public service detail pages now use the same card, border, spacing and two-column review structure as the acquisition review workspace, with client-facing content. Overview, outcomes, delivery guidance, published pricing and FAQs remain public. Published service features are visible to guests; only active signed-in accounts can configure and continue.

Start a project authenticates first and directs the customer to choose a service. Opening a service exposes selectable feature cards, Help me decide and up to 1,000 characters of additional service requirements. The existing catalogue does not model included versus paid extras. Featured is not treated as included, and no feature prices or automatic quotes are invented.

Continue to onboarding uses a signed, HttpOnly, same-site, owner-bound cookie with a two-hour expiry. Choices are not put in URLs or local storage. One pending selection is retained per browser; opening a different service can replace that pending selection. Return from sign-in preserves the service URL. Expired, changed or different-account selections require review at the service page.

The onboarding wizard shows the selected service, allows feature preferences to be edited, and retains the business, goals, audience, budget, timing and private attachments steps. General service/build guidance remains available for older briefs. No project or payment is created by selecting a service.

## Request persistence and authority

Existing Systems account/session checks and the current onboarding persistence path are retained. The shared API supplies public catalogue records; final submission resolves the active published service and validates every chosen feature slug against that service before saving. Client-supplied feature names or prices do not establish scope. New catalogue requests reference the chosen service, instead of being silently mapped to a generic build-type service.

The existing private brief metadata stores the selected service name/slug, chosen feature labels/descriptions/outcomes, guidance flag and additional requirements. The same selections are included in the readable request description for existing admin/project handover surfaces. No Prisma schema change, migration or seed is required. This extends the existing hybrid onboarding boundary; moving all legacy onboarding writes into rcentz-api is separate work.

Saved request edits preserve prior labels/descriptions for unchanged selected features even after catalogue renames. Added features must belong to the same currently published service. Archived services do not gain new features through editing. Owners may adjust pending briefs; reviewed/converted requests remain locked as before. Existing owner isolation, same-origin mutation checks, optimistic edit conflicts, private file authorization and duplicate-submission handling remain in force. Attachments and legacy briefs are retained.

Customer and admin review display the saved selection; final scope, quote, delivery agreement and payment remain separate decisions.

## Verification

Controlled tests exercise actual selection action, onboarding page, create/edit handlers and persistence functions with isolated fixtures: auth before service reads, signed token tamper/expiry/account isolation, service selection, guidance, foreign-feature rejection, canonical persistence, repeated submission, catalogue rename preservation, origin/owner/stage/concurrency gates and legacy compatibility. Existing catalogue, commercial and admin checks pass. TypeScript, changed-file ESLint and the production build pass with the public API offline during build.

Actual production-server HTML was checked with a controlled upstream for service feature text, disabled guest configuration and same-service sign-in return. Automated Chromium layout checks were blocked by this execution environment; desktop/mobile visual acceptance remains pending.

Authenticated live customer submission and admin visibility on the exact deployed revision remain required acceptance checks. The installer/verifier do not create live requests, upload files, change permissions, run migrations, commit or push.
