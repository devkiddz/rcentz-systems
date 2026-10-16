# Public service catalogue — 16 October 2026

## Scope and authority

The approved desktop/mobile design concept is implemented as a responsive catalogue at `/services`, replacing its homepage redirect. Existing Rcentz logo, public shell, Geist fonts, content widths, theme/palette tokens, account navigation and footer remain authoritative. Desktop uses three columns, tablet two and mobile one; filters scroll horizontally on small screens.

The existing shared API `/api/v1/services` supplies published offers. The UI validates bounded public records and unique slugs/identities; six existing services lead the initial grid, with search, category filters, progressive reveal, a complete server-rendered service index and empty/error states. Current public API contains 35 offers. New offers, prices and promised delivery terms are not invented or seeded.

Small interface previews are code-native illustrations, visibly labelled. They are not representations of completed customer projects or measured analytics. Real portfolio evidence is linked separately. Illustrations need no Cloudinary upload and do not change the existing project-media pipeline.

## Enquiry flow

Service detail buttons previously targeted `/contact`, which is absent from Systems. They now target `/start-project?service=<slug>`. The authenticated entry point validates the slug, preserves that return URL through sign-in and reads the selected published service from the shared API. Its name and slug prefill the brief title and notes. The existing build-type selection remains required; existing request creation, service-lane mappings and write authority are unchanged. The selected offer is enquiry context, not an agreed scope, quotation or order.

## Search discovery

- Public header and footer link to the catalogue.
- The complete index includes every returned service link in initial HTML, in the server response. Interactive filtering and reveal controls use JavaScript.
- Catalogue canonical/Open Graph metadata and script-safe CollectionPage/ItemList structured data are provided.
- Existing service detail metadata now uses configured SEO fields where present, otherwise service data; canonical URLs, robots instructions and optional HTTPS social images are supported. Service/BreadcrumbList JSON-LD uses published service data without ratings or invented offers.
- `/sitemap.xml` includes known public pages and returned service URLs, generated at request time. Builds do not fetch the API for the sitemap. Serving the sitemap still requires the existing RCENTZ_API_URL configuration and a reachable API. `/robots.txt` advertises the sitemap and excludes private route prefixes from crawling; access control remains independent.
- Private enquiry/account/admin pages remain private. Search rankings and indexing are not guaranteed by these changes.

## Verification and acceptance

Production build, TypeScript, changed-file ESLint, controlled public-catalogue/SEO/auth-return regressions and existing commercial/admin checks passed. Browser tests used the actual local production build with the live public API, placeholder local account configuration and no sign-in or database submission. They covered light/dark rendering at 320/390/1280px, no document overflow, search/category intersections, reveal/reset/empty states, all 35 service links present in the server-rendered DOM with JavaScript disabled, sitemap/structured data, detail/missing-service handling (not-found UI and noindex; Next.js streamed responses can carry HTTP 200) and anonymous enquiry return URL. Logged-in enquiry-context prefilling was checked with controlled fixtures, not a live user submission.

After installation, verify both themes and your chosen palette, published service content/pricing, menu on desktop/mobile, and sign in to inspect the prefilled title/notes before submitting any real brief. Confirm `/services`, `/robots.txt` and `/sitemap.xml` on the exact production deployment, then measure real indexing/enquiries separately. No API deployment or database migration/seed is required. The installer/verifier do not create a project brief, run collection, submit bids, commit or deploy.

## Service selection update — 16 October 2026

The follow-up described in SERVICE-FEATURE-SELECTION-20261016.md supersedes the original enquiry-only entry above. Service detail now presents a client review/configuration page. Signed-in feature preferences flow into onboarding and are saved with the request. Generic Start a project directs signed-in clients to choose a service. The original 5954805 catalogue release is deployed; this follow-up still needs its own installation, deployment and authenticated acceptance.
