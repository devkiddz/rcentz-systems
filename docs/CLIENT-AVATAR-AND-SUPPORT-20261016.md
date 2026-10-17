# Client avatar and page-pointer support — 16 October 2026

Baseline: Systems beae1b3006440e9c46e520b416f7561786bf5bcb.

## Support motion

The previous animation was restricted to hovering directly over the small launcher. The new compact headset follows mouse movement across the page, using bounded perspective rotation and at most two pixels of movement. Updates use a single animation frame and CSS properties without React state updates. The 48px control, 20px icon, tray, theme colours and drag controls remain. Dragging pauses the effect; pointer exit, blur, hidden page, preference changes and unmount reset it. Touch, pen, coarse pointers and reduced motion do not animate.

## Account avatar

Edit account now provides upload, square crop with circular preview, zoom, replacement and confirmed removal. The existing react-easy-crop and authenticated Cloudinary transport are reused. Saved avatars update the existing User.image field; no schema or credential changes.

Mutation endpoints verify origin, active local identity, a bounded multipart body, JPEG signature and type, canonical account version, and provider-validated square dimensions. Owner identity comes from the session. The database image change and audit entry commit together with an optimistic version guard. Failed or conflicting writes clean up the newly uploaded asset; replacement/removal only clean up a matching asset in that user's hashed storage folder. External pre-existing avatar URLs are never deleted. Failed storage cleanup is recorded for follow-up.

Avatar delivery is authenticated, no-store and limited to the owner, active administrators or current shared-conversation participants. Stored canonical image version controls delivery; arbitrary external URLs are never fetched. Storage responses are bounded and restricted to JPEG. Members without an authorized relation receive no image. Existing headers already read User.image; refreshing the route after save updates them. Avatar and account changes share the current account version, and avatar saves preserve unsaved account fields.

## Verification

Controlled actual-handler fixtures cover origin/account gates, image limits and membership, optimistic conflicts, rollback cleanup, deletion and private delivery. Component fixtures cover global pointer following, frame coalescing, reduced motion, drag and listener cleanup. Existing workspace/admin/service/catalogue/commercial checks, changed-file ESLint, TypeScript and the production build must pass.

Live signed-in crop/upload/remove, header refresh, authorized shared-conversation avatars, theme switching and desktop/mobile pointer acceptance remain required. No live uploads or database writes are performed by the installer or verifier.
