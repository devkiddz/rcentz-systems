import 'server-only';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

export type BriefMediaType = 'image' | 'raw';

// Match the credential patterns used by the existing private project-image pipeline.
// Keep credentials on the server; never return Cloudinary delivery URLs to the client.
function credentials() {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    return {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true as const
    };
  }
  try {
    const url = new URL(process.env.CLOUDINARY_URL || '');
    if (url.protocol === 'cloudinary:' && url.username && url.password && url.hostname) {
      return {
        cloud_name: url.hostname,
        api_key: decodeURIComponent(url.username),
        api_secret: decodeURIComponent(url.password),
        secure: true as const
      };
    }
  } catch {
    // No valid Cloudinary configuration.
  }
  return null;
}

function options() {
  const configured = credentials();
  if (!configured) throw new Error('Private attachment storage is not configured.');
  return configured;
}

// PDFs must be uploaded as raw assets; images stay in the image resource type.
// Authenticated delivery protects the original asset at the provider as well.
export async function uploadBriefAttachment(
  bytes: Uint8Array,
  publicId: string,
  mediaType: BriefMediaType
): Promise<UploadApiResponse> {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        ...options(),
        public_id: publicId,
        resource_type: mediaType,
        type: 'authenticated',
        overwrite: false,
        timeout: 15000
      },
      (error, result) => {
        if (error || !result) reject(new Error('Private attachment upload failed.'));
        else resolve(result);
      }
    );
    stream.on('error', () => reject(new Error('Private attachment upload failed.')));
    stream.end(Buffer.from(bytes));
  });
}

export async function removeBriefAttachment(publicId: string, mediaType: BriefMediaType) {
  await cloudinary.uploader.destroy(publicId, {
    ...options(),
    resource_type: mediaType,
    type: 'authenticated',
    invalidate: true
  });
}

export function briefAttachmentDeliveryUrl(publicId: string, mediaType: BriefMediaType) {
  return cloudinary.url(publicId, {
    ...options(),
    resource_type: mediaType,
    type: 'authenticated',
    sign_url: true,
    secure: true
  });
}

// Parsed from server-written metadata only; enforce the exact owner + brief
// prefix to avoid accidentally serving unrelated media from the same account.
export function parseBriefCloudinaryPath(
  pathname: string,
  ownerId: string,
  requestId: string
): { mediaType: BriefMediaType; publicId: string } | null {
  const match = /^cloudinary:(image|raw):(.+)$/.exec(pathname);
  if (!match) return null;
  const prefix = `rcentz/briefs/${ownerId}/${requestId}/`;
  const publicId = match[2];
  if (!publicId.startsWith(prefix)) return null;
  const name = publicId.slice(prefix.length);
  if (!/^[a-zA-Z0-9_.-]+$/.test(name) || name.startsWith('.')) return null;
  return { mediaType: match[1] as BriefMediaType, publicId };
}
