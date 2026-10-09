import 'server-only';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

function credentials() {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    return { cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true };
  }
  try {
    const url = new URL(process.env.CLOUDINARY_URL || '');
    if (url.protocol === 'cloudinary:' && url.username && url.password && url.hostname) return { cloud_name: url.hostname, api_key: decodeURIComponent(url.username), api_secret: decodeURIComponent(url.password), secure: true };
  } catch { /* Missing or invalid configuration. */ }
  return null;
}
export function projectImagesConfigured() { return Boolean(credentials()); }
function options() { const value = credentials(); if (!value) throw new Error('Cloudinary is not configured.'); return value; }
export async function uploadProjectImage(bytes: Uint8Array, publicId: string) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader.upload_stream({ ...options(), public_id: publicId, resource_type: 'image', type: 'authenticated', overwrite: false, timeout: 15000 }, (error, result) => {
      if (error || !result) reject(new Error('Cloudinary upload failed.'));
      else resolve(result);
    }).end(Buffer.from(bytes));
  });
}
export async function removeProjectImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId, { ...options(), resource_type: 'image', type: 'authenticated', invalidate: true });
}
export function projectImageDeliveryUrl(publicId: string) {
  return cloudinary.url(publicId, { ...options(), resource_type: 'image', type: 'authenticated', sign_url: true });
}
