# Rcentz Systems — Opportunity Intelligence & Acquisition: current phase handoff

**Date:** 10 October 2026. **Purpose:** durable engineering direction and controlled status record. **Status:** documentation prepared; no code, database, production or Git writes in this release.

## Product objective

Rcentz Systems must know what Rcentz can credibly deliver, recognise who may need that work, help the company acquire it, and connect resulting engagements to existing Rcentz operations. The primary purpose is commercial acquisition: customers, gigs, projects, retainers and contracts. Dennis's personal remote employment search remains a separate lane. Location of work never determines whether an engagement is employment or a company contract; the actual agreement does.

This is an **internal Rcentz capability**, not a client-facing marketplace or a second project manager. The public Systems homepage already presents Rcentz services; do not create an extra public Services page. Present a focused set of authentic core services publicly and keep expansive problem vocabulary, search phrases, qualification evidence and research privately.

## Ownership and security

- **rcentz-api:** canonical models, storage, validations, search/qualification logic, permissions and audit trail.
- **rcentz-systems:** authenticated private workspace and user interface; no bypass through direct database writes for the new feature.
- Preserve existing signed application identity, owner checks, bounded inputs, source checks, deduplication, cooling periods and saved decisions. Team access is **not** granted as part of OA-02.
- Company acquisition and personal employment have distinct identities, permissions, eligibility, reporting and outcomes. Unknown capacity is unknown, not unlimited. No claim of work delivery without evidence.
- Discovery must distinguish an actual buyer request from a company merely researched as a possible prospect. No autonomous email, bid, application or proposal submission.

## Vertical delivery sequence

1. Validate current baseline, repository refs, source collection and authorization before modifications.
2. Build **one** company profile and capability in API, connecting to the existing Service and verifiable Project / RcentzProduct records; implement additive migration with explicit approval and dry-run seed.
3. Build the private Systems company-capability management surface immediately after API operations, and verify read/edit/permissions end to end.
4. In OA-03, use capability descriptions, business problems, buyer expressions, solution plans and proof to classify and prioritise genuine commercial opportunities while keeping employment collection intact.
5. In OA-04, add review/pursuit and human-approved messaging drafts. In OA-05, link a commercial win once to an existing client/service/project arrangement as appropriate; personal jobs do not create company revenue.
6. Correct interface and printing issues alongside affected flows. Release only after live tests and authorized-access tests.

## OA-02 initial knowledge (source: attached model-and-seed proposal)

- `CompanyOpportunityProfile`: Rcentz, Nigeria, remote digital delivery; start dates, hours and capacity unconfirmed; internal visibility; approved manager resolved from an existing authorized account.
- `CompanyCapability`: `custom-business-application-development` linked to existing Service `custom-web-application-development`, status draft; business problems, delivery limits and grouped buyer expressions.
- `CapabilitySolution` (draft): customer service/project portal; internal operations/approval workspace; booking/enquiry management. Each must describe the buyer's problem, possible workflow, deliverables, questions and exclusions.
- `CapabilityEvidence`: link exact existing work and feature-specific implemented claim; distinguish proposed, inspected, local-tested, live-tested, client-delivered. Never silently resolve a missing reference to an unrelated project.

**Seed contract:** one dedicated preview-and-apply flow; preflight database/manager/service; explicit additive migration; stable identifiers; second run no duplicate and no overwrite of edited content; no changes to personal profiles, opportunities, saved decisions, service prices, public publication, projects or existing catalogue.

## Milestone ledger — verified vs pending

| ID | Name | Current position | Completion gate |
| --- | --- | --- | --- |
| OA-00 | Direction & documents | Earlier package prepared; current package adds handoff only. Installed/pushed completion not independently established | Confirm exact canonical docs in both Git repositories |
| OA-01 | Stabilize finder | User-reported successful live tests on 10 Oct; automatic daily scheduled execution unobserved; not formally closed | Record run evidence, authorization and deployed commit; observe scheduled collection |
| OA-02 | Company capability model and UI | Proposal reviewed; **not implemented or seeded** | Additive API models, seed preview/apply, guarded CRUD, Systems UI, evidence links and negative tests |
| OA-03 | Commercial discovery | Pending | Grounded buyer leads and contracts, useful matching explanations, separate employment lane |
| OA-04 | Pursuit management | Pending | Human-reviewed outreach/proposals and durable stages/history |
| OA-05 | Conversion to operations | Pending | Authorized, idempotent commercial handover; no employment contamination |
| OA-06 | Design & printing corrections | Pending / in parallel | Screen, theme, typography, responsive and print review |
| OA-07 | Usable-release gate | Pending | Real discovery-to-pursuit checks, production and access evidence |
| TW-01 | Teams & authorities | After usable Opportunities release | Separate permissions design and verification |

**Observed Git repository heads in this conversation:** API `6f5564ac75df7144f0cab62940adfe9bb7a67e47`; Systems `c469119617d6fa9babb571e6b8563e8ef5eb3624`. These match the OA-02 proposal handoff. These are repository source observations, not proof that production deployment uses those exact commits.

## Installation and release rule

Engineer prepares → operator previews and installs → inspect changes → local checks → commit/push after inspection → verify pushed/deployed version → record results → close milestone only with evidence. Preserve existing documents and data. A green build by itself is insufficient proof of authorization or correct business behavior.

## Immediate engineering work

OA-02.1 in `rcentz-api`: design Prisma relationships, deletion restrictions, indexes and additive migration; inspect actual existing service and project identities; add bounded company-only operations using the existing authorization contract. Then build controlled seed and Systems management UI as one vertical milestone. Do **not** start OA-03 collection expansion or a new public Services page first.
