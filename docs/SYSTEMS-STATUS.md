# Rcentz Systems — current project status

Updated: 10 October 2026 (Africa/Lagos). Scope: the extracted `rcentz-systems` application. This snapshot supersedes the inherited August/September immediate-focus and handoff notes in the master documents; it does not declare every management system formally closed.

## Current direction and evidence

Opportunities now has an existing implementation to review and extend. Its primary direction is Rcentz customer and contract acquisition, with personal employment preserved separately. [OPPORTUNITY-DIRECTION.md](OPPORTUNITY-DIRECTION.md) governs the current scope, milestone order and completion checks. Source presence does not establish live verification.

Repository snapshots reviewed: Systems `1e69408b5c80e2910fd10a1f9ec3654b6bfaf6a1`; API `589efe23b7e63244f3ce34e56155eb78ed1f75c7`. Opportunity routes and supporting code exist in both repositories. Earlier release notes describe buyer-request research and contacts. Their live behavior must be checked under OA-01. OA-00 is complete. Verified pushed evidence: Systems `ad744d976ea475acdfba40b38a51378d44d60722`; API `377c1bc4cd297b43c3f071516dda3cc275468b9b`. All seven saved documents matched the reviewed package; the shared document matches across both repositories. Printing and redundant UI are user-reported issues awaiting inspection.

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
