import { prisma } from "@/lib/prisma";
import {
  readClientMutation,
  clientMutationFailure,
  ClientMutationError,
} from "@/features/client/server/client-mutation";
import { parseSettings } from "@/features/client/lib/settings";
export async function POST(request: Request) {
  try {
    const { user, input } = await readClientMutation(request);
    if (!input || typeof input !== "object" || Array.isArray(input))
      throw new ClientMutationError(400, "Check your account details.");
    const source = input as Record<string, unknown>;
    const values = parseSettings(source.section, source.values);
    if (
      !values ||
      !(
        source.updatedAt === null ||
        (typeof source.updatedAt === "string" &&
          /^\d{4}-\d{2}-\d{2}T/.test(source.updatedAt) &&
          Number.isFinite(new Date(source.updatedAt).getTime()))
      )
    )
      throw new ClientMutationError(
        400,
        "Check the required fields, phone number and website address.",
      );
    const version = await prisma.$transaction(async (tx) => {
      const active = await tx.user.findFirst({
        where: { id: user.id, status: "ACTIVE" },
        select: { id: true },
      });
      if (!active)
        throw new ClientMutationError(403, "This account cannot make changes.");
      if (source.section === "account") {
        if (!source.updatedAt)
          throw new ClientMutationError(
            409,
            "Reload before editing your account.",
          );
        const now = new Date();
        const result = await tx.user.updateMany({
          where: {
            id: user.id,
            status: "ACTIVE",
            updatedAt: new Date(String(source.updatedAt)),
          },
          data: {
            name: values.name,
            phone: values.phone || null,
            bio: values.bio || null,
            updatedAt: now,
          },
        });
        if (!result.count)
          throw new ClientMutationError(
            409,
            "Your account changed in another tab. Reload before saving.",
          );
        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: "CLIENT_ACCOUNT_UPDATED",
            entityType: "User",
            entityId: user.id,
          },
        });
        return now.toISOString();
      }
      const existing = await tx.clientProfile.findUnique({
        where: { userId: user.id },
        select: { id: true, updatedAt: true },
      });
      if ((existing?.updatedAt.toISOString() || null) !== source.updatedAt)
        throw new ClientMutationError(
          409,
          "Your billing details changed in another tab. Reload before saving.",
        );
      const data = {
        companyName: values.companyName || null,
        phone: values.phone || null,
        website: values.website || null,
        address: values.address || null,
        city: values.city || null,
        state: values.state || null,
        country: values.country || null,
      };
      if (!existing) {
        const created = await tx.clientProfile.create({
          data: { userId: user.id, ...data },
          select: { updatedAt: true },
        });
        return created.updatedAt.toISOString();
      }
      const now = new Date();
      const changed = await tx.clientProfile.updateMany({
        where: {
          id: existing.id,
          userId: user.id,
          updatedAt: existing.updatedAt,
        },
        data: { ...data, updatedAt: now },
      });
      if (!changed.count)
        throw new ClientMutationError(
          409,
          "Reload to review the latest billing details.",
        );
      return now.toISOString();
    });
    return Response.json(
      { saved: true, updatedAt: version },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    )
      return clientMutationFailure(
        new ClientMutationError(
          409,
          "Billing details were saved in another tab. Reload before saving.",
        ),
      );
    return clientMutationFailure(error);
  }
}
