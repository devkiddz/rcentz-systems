# Milestone Accountability R1A — Pure policy foundation

Source baseline: b29221a4cdbe8c27e2eba5c9a40ebf064c82fe51.

This is a non-operational foundation only: no Prisma migration, server action modification, dashboard change, or production behavior change. The new pure policy functions are intentionally not wired into the application yet.

## Confirmed source gaps

- `project-milestone-actions.ts` accepts client-supplied progress and allows `COMPLETED` without criteria verification.
- `create-admin-project.ts` and `update-admin-project.ts` accept manual project progress.
- `ProjectFeature.acceptanceCriteria` is JSON, but `ProjectMilestone` has no dedicated verification criteria or reviewer approval relation.
- `ProjectMilestoneRecord` already provides PDF/snapshot version records; do not duplicate it.
- Existing `ProjectActivity` provides activity records but does not alone enforce immutable verification history.

## Rules to enforce in subsequent guarded releases

1. Required criteria are individually verified and attributable to an authorized actor.
2. Zero required criteria means unmeasured and not approvable.
3. Milestone completion requires all required criteria and a separate authorized final approval.
4. Project progress counts approved completed milestones only. Cancelled milestones are excluded.
5. Legacy completions are not automatically verified. Preserve historical values separately.
6. Baseline amendments, waivers and overrides require reason, authority and append-only history.
7. Server actions, not React inputs, enforce authorization and calculations.
8. Database mutation, approval and progress recomputation must be atomic and concurrency-safe.
9. GitHub commits are evidence, not verification or progress updates.
10. Never mark a release complete solely because typecheck passes; include runtime, access-control and migration verification.

## Scope warning

This initial package adds only pure calculation policy and executable unit tests. Do not treat it as a finished milestone accountability feature. No migration or production deployment is authorized by this package.
