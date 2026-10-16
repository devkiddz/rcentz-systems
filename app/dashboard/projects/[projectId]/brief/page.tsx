import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/features/auth/server/require-auth";
import { prisma } from "@/lib/prisma";
import { ClientPageFrame } from "@/features/client/components/shell/ClientPageFrame";
import { AddProductBrief } from "@/features/client/components/projects/AddProductBrief";
import {
  PRODUCT_BRIEF_KIND,
  hasProjectBrief,
} from "@/features/client/lib/workspace";
export const metadata = {
  title: "Project brief",
  robots: { index: false, follow: false },
};
export default async function ProjectBriefPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireAuth("/dashboard/projects/" + projectId + "/brief");
  const project = await prisma.project.findFirst({
    where: { id: projectId, clientId: user.id },
    select: {
      id: true,
      name: true,
      description: true,
      purpose: true,
      vision: true,
      expectedOutcome: true,
      serviceRequest: { select: { id: true, userId: true } },
      activities: {
        where: {
          metadata: { path: ["kind"], equals: PRODUCT_BRIEF_KIND },
          visibility: { in: ["CLIENT", "PUBLIC"] },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, description: true, createdAt: true },
      },
    },
  });
  if (!project) notFound();
  return (
    <ClientPageFrame title="Project brief" description={project.name}>
      <Link
        href={"/dashboard/projects/" + project.id}
        className="inline-flex min-h-11 items-center text-sm underline"
      >
        ← Back to project
      </Link>
      {project.serviceRequest?.userId === user.id ? (
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Original onboarding request</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Review the service, selected features, business context and
            reference files saved with your request.
          </p>
          <Link
            href={"/dashboard/onboarding/" + project.serviceRequest.id}
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-foreground px-4 text-sm font-semibold text-background"
          >
            Review onboarding brief →
          </Link>
        </section>
      ) : null}
      {[
        ...(
          [
            ["Description", project.description],
            ["Purpose", project.purpose],
            ["Vision", project.vision],
            ["Expected outcome", project.expectedOutcome],
          ] as const
        ).filter(([, v]) => v?.trim()),
      ].map(([label, value]) => (
        <section
          key={label}
          className="rounded-2xl border border-border bg-card p-5 sm:p-6"
        >
          <h2 className="text-lg font-semibold">{label}</h2>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
            {value}
          </p>
        </section>
      ))}
      {project.activities.map((activity) => (
        <section
          key={activity.id}
          className="rounded-2xl border border-border bg-card p-5 sm:p-6"
        >
          <h2 className="text-lg font-semibold">Customer product brief</h2>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
            {activity.description}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Submitted{" "}
            {activity.createdAt.toLocaleDateString("en-GB", {
              timeZone: "Africa/Lagos",
            })}{" "}
            · Requirements for team review
          </p>
        </section>
      ))}
      {!hasProjectBrief(project) ? (
        <AddProductBrief projectId={project.id} />
      ) : null}
    </ClientPageFrame>
  );
}
