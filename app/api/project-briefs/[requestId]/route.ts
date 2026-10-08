import { getCurrentUser } from "@/features/auth/server/get-current-user";
import {
  validateBrief,
  describeBrief,
  buildOptions,
} from "@/features/onboarding/lib/project-brief";
import {
  BRIEF_KEY,
  readBriefData,
  writeBriefData,
} from "@/features/onboarding/server/brief-data";
import { prisma } from "@/lib/prisma";
export async function PATCH(
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
      { error: "Sign in to edit your brief." },
      { status: 401 },
    );
  const { requestId } = await params;
  try {
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return Response.json({ error: "Send a JSON brief." }, { status: 415 });
    const reader = request.body?.getReader();
    if (!reader)
      return Response.json({ error: "Brief required." }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 25000) {
        await reader.cancel();
        return Response.json({ error: "Brief too long." }, { status: 413 });
      }
      chunks.push(value);
    }
    let input;
    try {
      input = JSON.parse(Buffer.concat(chunks).toString());
    } catch {
      return Response.json({ error: "Invalid JSON brief." }, { status: 400 });
    }
    if (!input || typeof input !== "object" || Array.isArray(input))
      return Response.json({ error: "Brief required." }, { status: 400 });
    const { brief, errors } = validateBrief(input);
    if (Object.keys(errors).length)
      return Response.json(
        { error: "Check the highlighted fields.", fields: errors },
        { status: 400 },
      );
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${requestId}))`;
      const saved = await tx.serviceRequest.findFirst({
        where: { id: requestId, userId: user.id },
        select: {
          id: true,
          serviceId: true,
          status: true,
          updatedAt: true,
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
      if (saved.updatedAt.toISOString() !== input.updatedAt) return 412;
      const service = await tx.service.findFirst({
        where: {
          slug: buildOptions.find((option) => option.value === brief.build)
            ?.service,
          status: "ACTIVE",
        },
        select: { id: true },
      });
      if (!service) return 409;
      const data = readBriefData(saved.answers[0]?.metadata);
      const updated = await tx.serviceRequest.update({
        where: { id: requestId },
        data: {
          title: brief.title,
          description: describeBrief(brief),
          serviceId: service.id,
          currency: brief.currency,
          budget: brief.guidance ? null : brief.budget,
        },
        select: { updatedAt: true },
      });
      await writeBriefData(
        tx,
        { id: requestId, serviceId: service.id },
        { version: 1, brief, attachments: data?.attachments || [] },
      );
      return updated.updatedAt.toISOString();
    });
    if (typeof result === "number")
      return Response.json(
        {
          error:
            result === 404
              ? "Brief not found."
              : result === 412
                ? "Your brief changed in another tab. Reload before editing."
                : "This brief is already in delivery review. Contact the team to change the agreed scope.",
        },
        { status: result },
      );
    return Response.json({ id: requestId, updatedAt: result });
  } catch {
    return Response.json(
      { error: "We could not save your changes. Your answers are still here." },
      { status: 503 },
    );
  }
}
