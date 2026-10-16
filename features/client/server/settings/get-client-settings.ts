import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
export const getClientSettings = cache(async (userId: string) =>
  prisma.clientProfile.findUnique({
    where: { userId },
    select: {
      companyName: true,
      website: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      country: true,
      updatedAt: true,
    },
  }),
);
export const getClientMemberships = cache(async (userId: string) =>
  prisma.clientSubscription.findMany({
    where: { clientId: userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      subscriptionNumber: true,
      status: true,
      currency: true,
      priceAmount: true,
      intervalUnit: true,
      intervalCount: true,
      autoRenew: true,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: true,
      nextBillingAt: true,
      plan: { select: { name: true } },
    },
  }),
);
