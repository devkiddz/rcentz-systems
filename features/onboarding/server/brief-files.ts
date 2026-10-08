import 'server-only';
export const MAX_FILE_SIZE = 2 * 1024 * 1024;
export function detectBriefFile(bytes: Uint8Array) {
  const b = Buffer.from(bytes);
  if (b.subarray(0, 5).toString() === '%PDF-')
    return { type: 'application/pdf', extension: 'pdf' };
  if (b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    return { type: 'image/png', extension: 'png' };
  if (b[0] === 255 && b[1] === 216 && b[2] === 255)
    return { type: 'image/jpeg', extension: 'jpg' };
  if (
    b.subarray(0, 4).toString() === 'RIFF' &&
    b.subarray(8, 12).toString() === 'WEBP'
  )
    return { type: 'image/webp', extension: 'webp' };
  return null;
}
