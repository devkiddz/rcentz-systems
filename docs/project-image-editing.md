# Project images and progress signal

Progress endpoints use a larger 20px ring with a slow visual blink, including completed milestones. Reduced-motion settings disable animation. This decoration does not indicate a live network connection.

Administrators can crop PNG, JPEG and WebP images before saving them to the existing private Cloudinary image pipeline. Wide, landscape and square crops support dragging and zooming on desktop and mobile. Crops are flattened to JPEG, limited to 1920px on the longest edge, and compressed within the existing 2 MB server limit. Original selection limit: 20 MB.

Replace preserves the image record and gallery order. A refreshed private image URL invalidates the displayed preview. Delete requires confirmation; deleting the first image promotes the next image to the preview. Both operations authorize active staff, check origin and scope the media record to the project. Changes are audited. Failed replacement cleans the new upload and leaves the original intact. Provider cleanup failures after a successful save/delete are recorded as PROJECT_IMAGE_CLEANUP_PENDING for staff follow-up. Unmanaged or legacy references are removed from the gallery without deleting their external storage objects.

Validation: ESLint, TypeScript, production build, admin guard checks, private image delivery checks and mocked replacement/deletion tests. Browser interaction and real Cloudinary uploads must be checked after installation; no production credentials or database writes were used during development.

Manual check: crop a wide image, save, replace it with a square crop and verify the customer preview; delete it and verify the next preview. Confirm the ring blinks at 100%, and stays static with reduced motion enabled.

The next feature is the admin-only automatic job finder. It is not part of this release.
