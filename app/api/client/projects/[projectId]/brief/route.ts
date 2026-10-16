import { prisma } from "@/lib/prisma";
import {
  readClientMutation,
  clientMutationFailure,
  ClientMutationError,
} from "@/features/client/server/client-mutation";
import {
  parseProductBrief,
  hasProjectBrief,
  PRODUCT_BRIEF_KIND,
} from "@/features/client/lib/workspace";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { user, input } = await readClientMutation(request, 32000);
    const { projectId } = await params;
    if (!/^[A-Za-z0-9_-]{1,160}$/.test(projectId))
      throw new ClientMutationError(404, "Project not found.");
    const brief = parseProductBrief(input);
    if (!brief)
      throw new ClientMutationError(
        400,
        "Provide goals (20–4,000 characters), audience (3–500), features (10–4,000), and optional notes (up to 2,000).",
      );
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"client-product-brief:" + projectId}))`;
      const project = await tx.project.findFirst({
        where: { id: projectId, clientId: user.id },
        select: {
          id: true,
          description: true,
          purpose: true,
          vision: true,
          expectedOutcome: true,
          serviceRequest: { select: { id: true } },
          activities: {
            where: { metadata: { path: ["kind"], equals: PRODUCT_BRIEF_KIND } },
            take: 1,
            select: { id: true },
          },
        },
      });
      if (!project) throw new ClientMutationError(404, "Project not found.");
      if (hasProjectBrief(project))
        throw new ClientMutationError(
          409,
          "A brief is already available. Reload to review it.",
        );
      await tx.projectActivity.create({
        data: {
          projectId: project.id,
          userId: user.id,
          type: "COMMENTED",
          visibility: "CLIENT",
          title: "Product brief submitted",
          description: [
            "Goals:\n" + brief.goals,
            "Audience:\n" + brief.audience,
            "Requested features:\n" + brief.features,
            "Additional notes:\n" + (brief.notes || "None"),
          ].join("\n\n"),
          metadata: { kind: PRODUCT_BRIEF_KIND, version: 1, brief },
        },
      });
    });
    return Response.json(
      { saved: true },
      { status: 201, headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return clientMutationFailure(error);
  }
}
