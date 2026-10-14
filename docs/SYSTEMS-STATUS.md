# Rcentz Systems — current project status

Updated: 14 October 2026 (Africa/Lagos). Scope: the extracted `rcentz-systems` application. This snapshot supersedes the inherited August/September immediate-focus and handoff notes in the master documents; it does not declare every management system formally closed.

## Current source audit — 14 October 2026

Reviewed API checkpoint `0aa80a3` and Systems checkpoint `c65b3ca`. Read [CURRENT-WIRING-AUDIT-20261014.md](CURRENT-WIRING-AUDIT-20261014.md) for the current connections, verification limits and completion order. Older snapshot and milestone statements are historical evidence, not a declaration of current closure.

The existing customer delivery workflow has implemented routes and server operations. The latest commercial release adds profile/capability management, a problem/solution catalogue, source management, manual intake and a read-only UK procurement preview. Saved commercial prospect review, pursuit, evidence approval, broader commercial discovery and won-work handover are not fully connected. Career pages are placeholders while the personal hunt remains under legacy routes. The existing scheduled route collects personal opportunities only; commercial automation is explicitly disabled.

Both current source builds passed local verification. Prepared repairs restore the API operation-scope check, the Systems admin-page guard check and the legacy settings check after new commercial imports/helper names were introduced. These checks do not change production permissions. Their installation/push and authenticated live acceptance remain separate.

OA-00 documentation alignment is complete. OA-01's previously reported manual/live checks remain evidence; automatic scheduled execution was not independently observed in this audit. OA-02 through OA-05 contain partially implemented or missing connections; do not mark them complete from route presence. UI/print and full release acceptance remain OA-06/OA-07 work. Team/workspace management remains a separate future release.

Public service and opportunity operations use the shared API. Existing request/project/invoice/conversation operations still include direct Systems database access, so the agreed full API ownership boundary is not yet complete. Preserve current data and move this work in reviewed slices.

## Historical image checkpoint

Feature checkpoint: `1af826d60491ee607c63983f4dc39fe48b31fcb5` — cropped project image management and clearer progress signals. This is the packaged source checkpoint, not a claim that this exact commit is already deployed. The installer checks/builds and pushes; production deployment and provider configuration remain separate.

## Implemented surfaces

| Area | Current implementation | Evidence / limits |
| --- | --- | --- |
| Public website | Responsive public pages, product/navigation showcases, theme controls and account-aware navigation | Public UI and onboarding have been exercised by the user. |
| Accounts and onboarding | Better Auth account access; authenticated project briefs; editable saved requests and private reference uploads | Production requires the configured database and auth environment. Requested budget is not an agreed project price. |
| Customer workspace | Projects, milestones, preview/files, billing, messages, notifications, appearance settings and support entry points | User reports the customer workspace tests are working. This is not an independent audit of every production flow. |
| Admin workspace | Guarded client/request/project/invoice views; onboarding preview; planning, milestone and progress management | Active staff authorization is required before protected data access and mutations. |
| Project images | Existing private Cloudinary pipeline; crop, replace and confirmed delete controls | Crop interactions and real provider uploads need a post-installation check for this release. |
| Progress display | Larger 20px endpoint ring with a slow blink, including completed milestones | Reduced motion disables animation. The signal does not represent a network heartbeat. |
| Analytics and communication | Live tracker ingestion/configuration and workspace messaging/support routes exist | Report observed data only. Do not interpret demo content as measured production performance or payment-provider transactions. |
| Canvas | Collapsed customer/admin workspaces follow the public content width and gutters | Public content maximum is currently 1360px; expanded sidebar layout remains separate. |

## Image workflow and safeguards

Select PNG, JPEG or WebP, drag/zoom a wide, landscape or square crop, then save. The local selection limit is 20 MB. The saved crop is flattened to JPEG, capped at 1920px on its longest edge and compressed to meet the existing 2 MB server upload limit.

Replacement preserves the record and gallery order. Replacing the first image updates the customer preview; deleting it promotes the next image. Versioned private image URLs refresh the displayed preview.

Upload, replace and delete authorize active administrators, check request origin, scope records to the project and audit changes. Failed replacement leaves the original intact and removes only the new upload. Cleanup of old Cloudinary objects follows a successful database change; failures are recorded for staff follow-up. External/legacy references are removed from the gallery without deleting unmanaged storage objects. No schema migration is required.

Details: [project image editing](project-image-editing.md).

## Verification status

For the latest feature release, ESLint, TypeScript, production build, admin guard tests, private-image delivery checks and mocked image-editing tests passed. No production credentials or database writes were used during this verification. Browser automation was unavailable in the development environment; therefore visual cropping and real Cloudinary operations have not been independently verified.

After installing and deploying: crop/save an image, replace it and inspect the customer preview, delete it and check the next preview, then check the completed progress ring with and without reduced motion. A successful push alone does not verify Vercel deployment or runtime credentials.

## Next work: opportunity acquisition upgrade

Documentation alignment is complete. Next, review and stabilize the existing finder under OA-01. Build one focused company capability through API and Systems, use it for commercial discovery, manage pursuit, and link won commercial work to existing delivery management. Preserve personal employment and owner privacy. Human review and an explicit instruction are required before sending applications or outreach. Correct relevant interface and print issues alongside the work. Do not mark any upgrade milestone complete from documentation alone.

Agreed scope: [admin opportunity finder](admin-opportunity-finder-scope.md).

## Documentation map

- [Master blueprint](MASTER-BLUEPRINT.md): long-term product direction and inherited Rcentz vision.
- [Architecture](ARCHITECTURE.md): engineering conventions, with current Systems boundary notes.
- [Milestones](MILESTONES.md): current handoff plus historical management-system records.
- [Live tracker and messaging](live-tracker-and-messaging.md): implementation and integration notes.
- [Admin polish](admin-polish-release.md): branding and dedicated onboarding preview.
- [Brief editing and uploads](brief-editing-and-uploads.txt): saved brief/reference workflow.

Keep source verification, user-reported runtime tests, packaged releases and verified deployments distinct in future updates.

## Prepared commercial acquisition release — 14 October 2026

The acquisition release now replaces the UK-only discovery screen with worldwide and Nigeria public web collection, connects the daily commercial schedule, and exposes saved leads with source evidence, matching reasons, progress, notes and review history. Local controlled tests and both production builds passed. Installation and exact deployed/live acceptance remain pending. Follow [COMMERCIAL-ACQUISITION-RELEASE-20261014.md](COMMERCIAL-ACQUISITION-RELEASE-20261014.md). This prepared release supersedes the earlier acquisition gaps only after installation; delivery handover, evidence readiness, Career migration and teams remain open. No database change is required.
