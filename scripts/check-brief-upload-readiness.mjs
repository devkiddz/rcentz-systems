// Read-only check; never print credentials or call external services.
// Mirrors the existing private Cloudinary project-image credential resolution.
function configuredFromUrl() {
  try {
    const url = new URL(process.env.CLOUDINARY_URL || '');
    return url.protocol === 'cloudinary:' &&
      Boolean(url.username && url.password && url.hostname);
  } catch {
    return false;
  }
}
const configured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) || configuredFromUrl();

if (configured) {
  console.log('Brief Cloudinary storage: configured in this process environment.');
  console.log('Authenticated PNG/JPEG/WebP and raw PDF upload must still be tested.');
} else {
  console.log('Brief Cloudinary storage: NOT configured in this process environment.');
  console.log('Use the existing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET');
  console.log('or CLOUDINARY_URL in the Systems environment. Never commit credentials.');
  console.log('This local check does not inspect Vercel production environment settings.');
}
if (process.env.BLOB_READ_WRITE_TOKEN) {
  console.log('Legacy Blob token detected; new attachments use Cloudinary instead.');
}
