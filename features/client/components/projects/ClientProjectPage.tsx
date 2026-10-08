import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import type { ClientProjectAnalytics } from "@/features/analytics/server/read/get-client-project-analytics";

import { ProjectDetailsSection } from "@/features/client/components/overview/ProjectDetailsSection";

import type { ClientProject } from "@/features/client/server/projects/get-client-project";

import { ClientProjectAnalyticsSection } from "./ClientProjectAnalyticsSection";
import { ClientProjectFinanceSection } from "./ClientProjectFinanceSection";
import { ProjectSupportBubble } from "./ProjectSupportBubble";

type ClientProjectPageProps = {
  project: ClientProject;
  analytics: ClientProjectAnalytics;
};

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ClientProjectPage({
  project,
  analytics,
}: ClientProjectPageProps) {
  return (
    <main className="py-6 sm:py-8">
      <div className="space-y-8">
        <section className="px-1">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Projects
          </Link>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Project workspace
              </p>

              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-foreground sm:text-[28px]">
                {project.name}
              </h1>

              <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-muted-foreground">
                {project.description ??
                  project.purpose ??
                  "Project delivery, management and performance intelligence."}
              </p>
            </div>

            <span className="w-fit rounded-full border border-border bg-surface-muted px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {formatLabel(project.status)}
            </span>
          </div>
        </section>

        <ProjectDetailsSection project={project} analytics={analytics} />

        {project.slug === "demo-dennis-portfolio-complete-v1" ? (
          <p className="rounded-xl border border-border bg-surface-muted px-5 py-3 text-xs leading-6 text-muted-foreground">
            Demonstration only: the quoted budget, invoices, payment
            confirmations, reviews and analytics are simulated. No funds were
            charged or received.
          </p>
        ) : null}
        <ClientProjectFinanceSection project={project} />
        <ClientProjectAnalyticsSection
          project={project}
          analytics={analytics}
        />
        <ProjectSupportBubble projectId={project.id} />

        {/*
          THEN:
          ClientProjectInventorySection
        */}
      </div>
    </main>
  );
}
