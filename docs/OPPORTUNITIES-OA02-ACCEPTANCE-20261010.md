# OA-02 — acceptance and installation checklist

Milestone has **not** been implemented or approved for seeding merely because this document exists.

## API

- [ ] Four proposed models reviewed against live canonical schema (`CompanyOpportunityProfile`, `CompanyCapability`, `CapabilitySolution`, `CapabilityEvidence`).
- [ ] Clear relational links to existing Service, Project and RcentzProduct; archival/deletion rules preserve evidence history.
- [ ] Explicit company capability read/write authority, without broadening personal OpportunityProfile access or existing admin access.
- [ ] Strict validation, bounded input, ownership and appropriate state transition rules.
- [ ] History identifying editor and meaningful capability/evidence revisions.
- [ ] Migration SQL inspected and deployed separately from seed; preexisting records unaffected.

## Seed

- [ ] Correct database target, approved manager and existing service resolved in a preview.
- [ ] One private company profile, one draft capability and three draft solutions created only after approval.
- [ ] Evidence links point to verified records; unresolved candidates reported, never substituted.
- [ ] Repeat seed produces no duplicates or silent overwrites.
- [ ] No modification to personal job profile, saved decisions, projects, service prices or publication settings.

## Systems

- [ ] Company Capabilities appears inside protected Opportunities area and matches current design system.
- [ ] Read/edit changes persist through API, not separate database write path.
- [ ] Unknown availability, capacity, proof readiness and limitations remain conspicuous.
- [ ] Existing owner/admin guard and API final checks reject unauthorized actors.
- [ ] Mobile/desktop, light/dark, printing and error states inspected.

## Release

- [ ] Existing finder collection, source validation, deduplication, decisions and personal employment flows continue to work.
- [ ] Relevant tests, negative authorization checks and build/typecheck pass.
- [ ] Exact Git and deployed revisions captured; backups and rollback documented.
- [ ] No messages, bids, proposals, applications or outreach are sent automatically.

**Release process:** engineer → install → inspect → push → test → mark complete. Mark each checkbox only with observed evidence.
