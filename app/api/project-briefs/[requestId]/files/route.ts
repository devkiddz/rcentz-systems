import { randomUUID } from "node:crypto";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/features/auth/server/get-current-user";
import {
  BRIEF_KEY,
  readBriefData,
  writeBriefData,
  legacyBrief,
  uploadsConfigured,
} from "@/features/onboarding/server/brief-data";
import {
  MAX_FILE_SIZE,
  detectBriefFile,
} from "@/features/onboarding/server/brief-files";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> },
) {
  if (
    request.headers.get("origin") !==
    new URL(process.env.BETTER_AUTH_URL || request.url).origin
  )
    return Response.json({ error: "Reload and try again." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE")
    return Response.json(
      { error: "Sign in to upload a file." },
      { status: 401 },
    );
  const { requestId } = await params;
  const owned = await prisma.serviceRequest.findFirst({
    where: { id: requestId, userId: user.id },
    select: { id: true },
  });
  if (!owned)
    return Response.json({ error: "Brief not found." }, { status: 404 });
  if (!uploadsConfigured())
    return Response.json(
      {
        error:
          "File storage is not connected yet. Your brief can still be saved without files.",
      },
      { status: 503 },
    );
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;"))
    return Response.json({ error: "Choose a project file." }, { status: 415 });
  let pathname: string | undefined;
  try {
    const reader = request.body?.getReader();
    if (!reader)
      return Response.json({ error: "Choose a file." }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_FILE_SIZE + 65536) {
        await reader.cancel();
        return Response.json(
          { error: "Each file must be 2 MB or smaller." },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    const form = await new Response(Buffer.concat(chunks), {
      headers: { "content-type": request.headers.get("content-type") || "" },
    }).formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size || file.size > MAX_FILE_SIZE)
      return Response.json(
        { error: "Choose a file up to 2 MB." },
        { status: 400 },
      );
    const bytes = new Uint8Array(await file.arrayBuffer());
    const format = detectBriefFile(bytes);
    if (!format)
      return Response.json(
        { error: "Use a PDF document, PNG, JPEG or WebP sample image." },
        { status: 415 },
      );
    const id = randomUUID();
    const result = await prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${requestId}))`;
        const saved = await tx.serviceRequest.findFirst({
          where: { id: requestId, userId: user.id },
          include: {
            service: { select: { slug: true } },
            project: { select: { id: true } },
            answers: {
              where: { question: { key: BRIEF_KEY } },
              select: { metadata: true },
            },
          },
        });
        if (!saved) return 404;
        if (!["DRAFT", "PENDING"].includes(saved.status) || saved.project)
          return 409;
        const data = readBriefData(saved.answers[0]?.metadata) || {
          version: 1 as const,
          brief: legacyBrief(saved),
          attachments: [],
        };
        if (data.attachments.length >= 5) return 409;
        const blob = await put(
          `briefs/${user.id}/${requestId}/${id}.${format.extension}`,
          Buffer.from(bytes),
          {
            access: "private",
            contentType: format.type,
            addRandomSuffix: false,
          },
        );
        pathname = blob.pathname;
        const attachment = {
          id,
          name:
            file.name.replace(/[\r\n\x00-\x1f]/g, "").slice(0, 160) ||
            `reference.${format.extension}`,
          type: format.type,
          size: file.size,
          pathname: blob.pathname,
        };
        await writeBriefData(tx, saved, {
          ...data,
          attachments: [...data.attachments, attachment],
        });
        return {
          id,
          name: attachment.name,
          type: attachment.type,
          size: attachment.size,
        };
      },
      { timeout: 20000 },
    );
    if (typeof result === "number")
      return Response.json(
        {
          error:
            result === 404
              ? "Brief not found."
              : "This brief cannot accept more files. Contact the team if delivery has begun.",
        },
        { status: result },
      );
    return Response.json(result, { status: 201 });
  } catch {
    if (pathname) await del(pathname).catch(() => {});
    return Response.json(
      { error: "Upload failed. Your saved brief is safe; try the file again." },
      { status: 503 },
    );
  }
}
