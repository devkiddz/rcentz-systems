import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/features/auth/server/require-auth";
import { ProjectBriefWizard } from "@/features/onboarding/components/ProjectBriefWizard";
import { ClientPageFrame } from "@/features/client/components/shell/ClientPageFrame";
import {
  BRIEF_KEY,
  readBriefData,
  legacyBrief,
  uploadsConfigured,
} from "@/features/onboarding/server/brief-data";
export default async function EditBriefPage({
  params,
  searchParams,
}: {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{ saved?: string; upload?: string }>;
}) {
  const { requestId } = await params;
  const user = await requireAuth(`/dashboard/onboarding/${requestId}`);
  const request = await prisma.serviceRequest.findFirst({
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
  if (!request) notFound();
  const data = readBriefData(request.answers[0]?.metadata);
  const notices = await searchParams;
  const editable =
    ["DRAFT", "PENDING"].includes(request.status) && !request.project;
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-8">
        {notices.saved ? (
          <p
            role="status"
            className="rounded-xl border border-border bg-surface-subtle p-4 text-sm"
          >
            Your project brief is saved. Review it or make further changes
            below.
          </p>
        ) : null}
        {notices.upload ? (
          <p
            role="alert"
            className="rounded-xl border border-border p-4 text-sm"
          >
            Your brief was saved, but one or more files could not upload.
            Re-select those files and try again.
          </p>
        ) : null}
        <section className="mt-4 rounded-2xl border border-border p-5">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <p className="text-xs capitalize text-muted-foreground">
                {request.status.toLowerCase().replaceAll("_", " ")} · Project
                brief
              </p>
              <h2 className="mt-2 text-lg font-semibold">{request.title}</h2>
            </div>
            <Link
              href="/dashboard/requests"
              className="inline-flex min-h-11 items-center text-sm underline"
            >
              All briefs
            </Link>
          </div>
          {data?.attachments.length ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {data.attachments.map((file) => (
                <li key={file.id}>
                  {file.type.startsWith("image/") ? (
                    <Image
                      unoptimized
                      src={`/api/project-briefs/${requestId}/files/${file.id}?preview=1`}
                      alt={file.name}
                      width={480}
                      height={270}
                      className="mb-2 aspect-video w-full rounded-lg border border-border object-contain"
                    />
                  ) : null}
                  <a
                    href={`/api/project-briefs/${requestId}/files/${file.id}`}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-lg bg-surface-subtle px-3 py-2 text-xs"
                  >
                    <span className="break-all">{file.name}</span>
                    <span className="shrink-0">
                      Download · {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
      {editable ? (
        <ProjectBriefWizard
          key={request.updatedAt.toISOString()}
          name={user.name}
          initialBrief={data?.brief || legacyBrief(request)}
          requestId={requestId}
          updatedAt={request.updatedAt.toISOString()}
          uploadsEnabled={uploadsConfigured()}
          existingFileCount={data?.attachments.length || 0}
        />
      ) : (
        <ClientPageFrame
          title="Your agreed project brief"
          description="Delivery has started or this request is no longer open. Contact the team to discuss scope changes."
        >
          <p className="whitespace-pre-wrap text-sm leading-7">
            {request.description}
          </p>
          <a
            className="inline-flex min-h-11 items-center underline"
            href="mailto:contact@rcentz.cc"
          >
            Discuss a change
          </a>
        </ClientPageFrame>
      )}
    </>
  );
}
