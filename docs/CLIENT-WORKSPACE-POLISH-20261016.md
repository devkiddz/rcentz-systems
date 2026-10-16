# Customer workspace polish — 16 October 2026

Prepared on Systems e9c34204fc570fcb6671cb7e70fbc1f1120ae081.

## Projects and layout

The customer dashboard uses a fluid canvas instead of the nested 1,200px cap. Shared DashboardCanvas retains its prior default for Admin and other callers; the customer layout opts into fluid width. The overview sheds its duplicate horizontal gutters. The current-project monitor on the right is unchanged.

Your projects now shows up to six recent, readable cards with full project names, domain, status, percentage, milestone completion, next delivery, target, delivery-health context, last update and a project action. Logos use existing project image assets explicitly tagged by filename, alt text or caption as logo/logomark/brand-mark. Only existing Cloudinary or local image URLs are accepted; missing or failed logos use project initials. Screenshots are not presented as logos. This update does not upload or invent brand assets. Logo retrieval is batched and scoped to the signed-in customer's projects.

The long project description is removed from the project-page introduction and application-access tagline, while the original record is retained. Review brief is placed immediately below Domain. The private project brief page displays original project context, a link to the customer's own onboarding request where linked, and any customer product brief. Existing reference files and selected service features remain in the onboarding request.

Projects without a brief show + Add product brief. The form records goals, audience, requested features and notes as a CLIENT-visible ProjectActivity attached to the existing project. It creates no second project, invoice or agreement and does not overwrite agreed project scope. Ownership, active account, origin, body size, existing-brief and duplicate-submission gates are enforced. A transaction/advisory lock serializes duplicate brief submissions. The original private content remains available. Admin project review also exposes the submitted product brief behind the admin guard.

## Project detail reference

The screenshot from Vercel guides the preview/details layout, footer action band and three separate cards below: scrollable Delivery checklist, Observability and Analytics. Every fetched deliverable is represented rather than truncating to four. Accepted items are visibly complete. Observability uses actual analytics collection state, recorded events, page views and ingestion/aggregation timestamps. Analytics uses recorded sessions, page views, clicks and events over the existing 30-day window. Sample data is labelled; unconfigured collection gets a truthful empty state. CDN requests, deployment branches, function invocations and error rates are not fabricated. Existing milestone, scope, finance and full analytics surfaces remain available.

## Settings

Settings links to working Edit account, Membership and Billing settings pages while retaining appearance and sign-out. Account editing saves the current user's name, phone and bio. Sign-in email, verification, role and account status cannot be changed by the form. Billing settings save company/contact/address/website fields on the current user's client profile. Issued invoice snapshots are not rewritten. Strict allowlists and optimistic timestamp checks prevent unauthorized fields and stale saves. The current user's status is checked again inside the transaction.

Membership displays up to 20 real, owner-scoped service-plan records with status, period dates, configured amount and renewal flags. An empty state does not imply a purchased membership. Changing/cancelling plans is routed to the team. Payment collection, card management, automated cancellation and purchasing memberships are separate payment work; these controls are not simulated.

These changes follow the existing Systems local account/client-record boundary. They do not complete migration of all business writes to the shared API. No schema change, migration, seed, permission assignment or live data change is run by the installer/verifier.

## Verification and acceptance

Controlled tests cover actual brief/settings handlers and request guards: anonymous/inactive rejection, origin checks, owner-scoped queries, one-time brief creation, original brief preservation, safe image fallback, setting allowlists, role/email protection, optimistic conflicts, billing create/update, oversized bodies, full checklist rendering, analytics empty states and admin authorization. Existing service-selection, catalogue, admin and commercial checks passed. TypeScript, changed-file ESLint and an offline-API production build passed. Built-route HTTP checks confirmed sign-in redirects for private settings/brief pages and 401 rejection for anonymous mutations.

Authenticated browser saves and desktop/mobile visual checks remain required on the exact deployed revision; they are not implied by controlled checks or build success. Confirm the original project brief opens under Domain, test Add product brief on an owned project without context, verify Admin sees that submission, save/reload account and billing details, and inspect membership empty/populated states. No live write was performed during local verification.
