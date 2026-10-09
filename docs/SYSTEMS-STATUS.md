# Rcentz Systems — current project status

Updated: 9 October 2026 (Africa/Lagos). Scope: the extracted `rcentz-systems` application. This snapshot supersedes the inherited August/September immediate-focus and handoff notes in the master documents; it does not declare every management system formally closed.

## Current checkpoint

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

## Next feature: private automatic job finder

The finder is planned, not implemented. Start with the Jobs & Contracts lane for Dennis, using verified sources, deduplication, open-status checks, honest skills/eligibility matching and a saved opportunity pipeline. Business Prospects is a later lane. Personal employment searches must remain private even from other admins by default. Draft applications and outreach require human review before sending.

Agreed scope: [admin opportunity finder](admin-opportunity-finder-scope.md).

## Documentation map

- [Master blueprint](MASTER-BLUEPRINT.md): long-term product direction and inherited Rcentz vision.
- [Architecture](ARCHITECTURE.md): engineering conventions, with current Systems boundary notes.
- [Milestones](MILESTONES.md): current handoff plus historical management-system records.
- [Live tracker and messaging](live-tracker-and-messaging.md): implementation and integration notes.
- [Admin polish](admin-polish-release.md): branding and dedicated onboarding preview.
- [Brief editing and uploads](brief-editing-and-uploads.txt): saved brief/reference workflow.

Keep source verification, user-reported runtime tests, packaged releases and verified deployments distinct in future updates.
