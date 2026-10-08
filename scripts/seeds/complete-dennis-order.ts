import type { PrismaClient } from "../../generated/prisma/client";
import { inspectSeed, SeedGuardError } from "./dennis-portfolio";
export const DEMO_QUOTE = "DEMO-DENNIS-ORDER-2026";
const amounts = [300000, 300000, 150000];
const names = [
  "Discovery, scope and design deposit",
  "Portfolio, contact and assistant development",
  "Quality review, launch and handover",
];
const date = (day: number) => new Date(Date.UTC(2026, 8, day, 12));
export async function inspectOrder(db: PrismaClient) {
  const state = await inspectSeed(db);
  if (!state.project || !state.project.serviceRequestId || !state.existing)
    throw new SeedGuardError(
      "Install Dennis’s original demonstration first. No account will be created or reset.",
    );
  const project = state.project;
  const quote = await db.quote.findUnique({
    where: { serviceRequestId: project.serviceRequestId! },
  });
  if (
    quote &&
    (quote.quoteNumber !== DEMO_QUOTE || quote.clientId !== project.clientId)
  )
    throw new SeedGuardError(
      "An unrelated quote exists. The demo expansion will not change it.",
    );
  const invoices = await db.invoice.findMany({
    where: { projectId: project.id },
    include: { payments: true },
  });
  if (
    invoices.some(
      (invoice) =>
        !invoice.invoiceNumber.startsWith("DEMO-DENNIS-INV-") ||
        invoice.clientId !== project.clientId ||
        invoice.payments.some(
          (payment) =>
            payment.provider !== "MANUAL" ||
            payment.providerName !== "Simulated demonstration",
        ),
    )
  )
    throw new SeedGuardError(
      "Real or unrelated billing exists on this project. No changes made.",
    );
  if (
    !quote &&
    (project.budget !== null ||
      invoices.length ||
      (await db.projectAnalyticsConfig.count({
        where: { projectId: project.id },
      })))
  )
    throw new SeedGuardError(
      "Budget, billing or analytics has already been edited. Refusing to overwrite it.",
    );
  // Stable identifiers must be unused or owned by this project.
  for (let index = 0; index < amounts.length; index++) {
    const invoice = await db.invoice.findUnique({
      where: { invoiceNumber: `DEMO-DENNIS-INV-${index + 1}` },
    });
    const payment = await db.payment.findUnique({
      where: { reference: `DEMO-DENNIS-PAY-${index + 1}` },
      include: { invoice: true },
    });
    if (
      (invoice && invoice.projectId !== project.id) ||
      (payment && payment.invoice.projectId !== project.id)
    )
      throw new SeedGuardError(
        "Reserved demo ledger identifier is already in use. No changes made.",
      );
  }
  return { ...state, project, quote, invoices };
}
export async function completeDennisOrder(db: PrismaClient) {
  return db.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(62187008)`;
      const state = await inspectOrder(tx as unknown as PrismaClient);
      const projectId = state.project.id;
      if (state.quote) {
        if (
          state.invoices.length !== 3 ||
          state.invoices.some(
            (invoice) =>
              invoice.status !== "PAID" ||
              Number(invoice.balanceDue) !== 0 ||
              invoice.payments.length !== 1,
          )
        )
          throw new SeedGuardError(
            "Existing demo ledger was changed or is incomplete. Inspect it manually; no records were reset.",
          );
        return {
          created: false,
          projectId,
          serviceRequestId: state.project.serviceRequestId,
        };
      }
      const metadata = {
        demo: true,
        notice:
          "Simulated order and payments. No funds were charged or received.",
        seed: "dennis-order-v2",
      };
      const quote = await tx.quote.create({
        data: {
          serviceRequestId: state.project.serviceRequestId!,
          clientId: state.project.clientId!,
          quoteNumber: DEMO_QUOTE,
          subtotal: 750000,
          total: 750000,
          currency: "NGN",
          status: "ACCEPTED",
          sentAt: date(1),
          acceptedAt: date(1),
          validUntil: date(8),
          createdAt: date(1),
          notes:
            "[DEMO] Accepted portfolio website order; ₦750,000 sample scope, not a real quote.",
          items: {
            create: names.map((name, index) => ({
              name,
              description:
                "[DEMO] Includes the agreed portfolio delivery scope.",
              unitPrice: amounts[index],
              total: amounts[index],
              serviceId: state.service.id,
            })),
          },
        },
      });
      for (let index = 0; index < amounts.length; index++) {
        const issued = date([1, 15, 29][index]);
        const invoice = await tx.invoice.create({
          data: {
            projectId,
            clientId: state.project.clientId,
            createdById: state.staff.id,
            serviceRequestId: state.project.serviceRequestId,
            quoteId: quote.id,
            invoiceNumber: `DEMO-DENNIS-INV-${index + 1}`,
            sourceType: "PROJECT",
            status: "PAID",
            currency: "NGN",
            subtotal: amounts[index],
            total: amounts[index],
            amountPaid: amounts[index],
            balanceDue: 0,
            customerName: "Dennis Jones",
            customerEmail: state.existing!.email,
            issuedAt: issued,
            dueAt: issued,
            paidAt: issued,
            createdAt: issued,
            notes:
              "[DEMO] Simulated paid invoice. Not a tax invoice or evidence of funds received.",
            metadata,
            items: {
              create: {
                name: names[index],
                description: "[DEMO] Sample delivery stage",
                type: "PROJECT",
                unitPrice: amounts[index],
                total: amounts[index],
                metadata,
              },
            },
          },
        });
        await tx.payment.create({
          data: {
            invoiceId: invoice.id,
            payerId: state.project.clientId,
            amount: amounts[index],
            netAmount: amounts[index],
            fee: 0,
            currency: "NGN",
            method: "MANUAL",
            provider: "MANUAL",
            providerName: "Simulated demonstration",
            reference: `DEMO-DENNIS-PAY-${index + 1}`,
            status: "SUCCESS",
            paidAt: issued,
            initiatedAt: issued,
            createdAt: issued,
            metadata,
          },
        });
        await tx.clientApproval.create({
          data: {
            invoiceId: invoice.id,
            entityType: "INVOICE",
            clientId: state.project.clientId!,
            requestedById: state.staff.id,
            respondedById: state.project.clientId,
            status: "ACCEPTED",
            title: `[DEMO] Billing stage ${index + 1} reviewed`,
            summary: metadata.notice,
            snapshot: { ...metadata, amount: amounts[index], currency: "NGN" },
            response:
              "Sample acceptance; no actual client response or transaction.",
            requestedAt: issued,
            respondedAt: issued,
            createdAt: issued,
          },
        });
      }
      await tx.project.update({
        where: { id: projectId },
        data: { budget: 750000, currency: "NGN" },
      });
      const end = new Date();
      const localDay = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Lagos",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(end);
      const sampleEnd = new Date(localDay + "T00:00:00Z");
      const values = [28, 37, 49, 62, 79, 94];
      let sessions = 0,
        pageViews = 0,
        clicks = 0,
        conversions = 0;
      for (let index = 0; index < values.length; index++) {
        const day = new Date(sampleEnd);
        day.setUTCDate(day.getUTCDate() - 5 + index);
        day.setUTCHours(0, 0, 0, 0);
        const views = values[index],
          visits = Math.round(views * 0.6),
          taps = Math.round(views * 0.25),
          leads = index > 2 ? 2 : 1;
        sessions += visits;
        pageViews += views;
        clicks += taps;
        conversions += leads;
        await tx.projectAnalyticsDaily.create({
          data: {
            projectId,
            date: day,
            sessions: visits,
            pageViews: views,
            clicks: taps,
            conversions: leads,
            serviceRequests: leads,
            totalEvents: visits + views + taps + leads,
          },
        });
      }
      // Never accept tracker submissions into a demonstration aggregate.
      await tx.projectAnalyticsConfig.create({
        data: {
          projectId,
          status: "PAUSED",
          timezone: "Africa/Lagos",
          clientVisible: true,
          allowedOrigins: [],
          startedAt: end,
          endedAt: end,
          lastAggregatedAt: end,
        },
      });
      await tx.projectAnalyticsGoal.create({
        data: {
          projectId,
          key: "demo_contact_request",
          name: "Sample contact enquiry",
          description:
            "[DEMO] Synthetic conversion example; collection is paused.",
          eventType: "SERVICE_REQUEST",
          active: true,
          isPrimary: true,
        },
      });
      await tx.projectAnalytics.create({
        data: {
          projectId,
          sessions,
          pageViews,
          clicks,
          conversions,
          serviceRequests: conversions,
          totalEvents: sessions + pageViews + clicks + conversions,
        },
      });
      return {
        created: true,
        projectId,
        serviceRequestId: state.project.serviceRequestId,
      };
    },
    { timeout: 60000, maxWait: 15000 },
  );
}
