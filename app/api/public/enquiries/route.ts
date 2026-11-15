import { randomBytes, timingSafeEqual } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { validatePublicEnquiry } from '@/features/enquiries/lib/public-enquiry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'no-store' };

function deny(status: number) {
  return Response.json({ error: 'Enquiry intake unavailable.' }, { status, headers });
}

function authorized(header: string | null, secret: string): boolean {
  if (!header?.startsWith('Bearer ')) return false;
  const supplied = Buffer.from(header.slice(7));
  const expected = Buffer.from(secret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

async function readLimited(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('missing');
  let bytes = 0;
  let input = '';
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 12_000) { await reader.cancel(); throw new Error('size'); }
    input += decoder.decode(value, { stream: true });
  }
  input += decoder.decode();
  return JSON.parse(input);
}

async function sendEnquiryNotification(record: {
  id: string;
  reference: string;
  name: string;
  email: string;
  purpose: string;
  message: string;
  company: string | null;
  phone: string | null;
  projectType: string | null;
  timeline: string | null;
  budgetNote: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RCENTZ_ENQUIRY_FROM;
  const to = process.env.RCENTZ_ENQUIRY_NOTIFY_TO;
  if (!apiKey || !from || !to) return;
  // Plain text avoids HTML injection; values never become email headers.
  const text = [
    `Reference: ${record.reference}`,
    `Purpose: ${record.purpose}`,
    `Name: ${record.name}`,
    `Email: ${record.email}`,
    `Company: ${record.company || '—'}`,
    `Phone: ${record.phone || '—'}`,
    `Project type: ${record.projectType || '—'}`,
    `Budget guidance: ${record.budgetNote || '—'}`,
    `Timeline: ${record.timeline || '—'}`,
    '',
    'Message:',
    record.message,
    '',
    'Review in Systems: /admin/enquiries',
  ].join('\n');
  try {
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: record.email,
        subject: `[Rcentz ${record.purpose === 'QUOTE' ? 'Quote request' : 'Enquiry'}] ${record.reference}`,
        text,
      }),
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
    if (!result.ok) throw new Error('Email provider rejected notification.');
    await prisma.publicEnquiry.update({ where: { id: record.id }, data: { notifiedAt: new Date() } });
  } catch {
    // The DB record remains available to admins; notification delivery is not the source of truth.
    console.error('Corporate enquiry saved but email notification could not be delivered.');
  }
}

export async function POST(request: Request) {
  const secret = process.env.RCENTZ_INTAKE_SHARED_SECRET;
  if (!secret || secret.length < 32) return deny(503);
  if (!authorized(request.headers.get('authorization'), secret)) return deny(401);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return deny(415);
  let raw: unknown;
  try { raw = await readLimited(request); } catch { return deny(400); }
  const enquiry = validatePublicEnquiry(raw);
  if (!enquiry) return deny(400);

  try {
    const existing = await prisma.publicEnquiry.findUnique({
      where: { submissionId: enquiry.submissionId },
      select: { reference: true },
    });
    if (existing) return Response.json({ reference: existing.reference }, { status: 200, headers });

    const reference = `RC${enquiry.purpose === 'QUOTE' ? 'Q' : 'E'}-${new Date().getUTCFullYear()}-${randomBytes(5).toString('hex').toUpperCase()}`;
    const record = await prisma.publicEnquiry.create({
      data: {
        reference,
        submissionId: enquiry.submissionId,
        purpose: enquiry.purpose,
        name: enquiry.name,
        email: enquiry.email,
        company: enquiry.company,
        phone: enquiry.phone,
        projectType: enquiry.projectType,
        budgetNote: enquiry.budgetNote,
        timeline: enquiry.timeline,
        message: enquiry.message,
        consentAt: new Date(),
      },
      select: {
        id: true, reference: true, name: true, email: true, purpose: true, message: true,
        company: true, phone: true, projectType: true, timeline: true, budgetNote: true,
      },
    });
    await sendEnquiryNotification(record);
    return Response.json({ reference: record.reference }, { status: 201, headers });
  } catch (error) {
    // A duplicate idempotency key can race the initial insert. Return its stored reference.
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      try {
        const existing = await prisma.publicEnquiry.findUnique({
          where: { submissionId: enquiry.submissionId },
          select: { reference: true },
        });
        if (existing) return Response.json({ reference: existing.reference }, { status: 200, headers });
      } catch { /* DB unavailable */ }
    }
    console.error('Corporate enquiry storage failed.');
    return deny(503);
  }
}
