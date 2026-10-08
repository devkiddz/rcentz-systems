import { requireAuth } from '@/features/auth/server/require-auth';
import { prisma } from '@/lib/prisma';
import { ClientPageFrame } from '@/features/client/components/shell/ClientPageFrame';
function safeFileUrl(value: string) {
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\'))
    return value;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export default async function FilesPage() {
  const user = await requireAuth('/dashboard/files');
  const files = await prisma.projectFile.findMany({
    where: {
      project: { clientId: user.id },
      visibility: { in: ['CLIENT', 'PUBLIC'] }
    },
    select: {
      id: true,
      name: true,
      url: true,
      project: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  return (
    <ClientPageFrame
      title="Project files"
      description="Documents shared with your account by the project team."
    >
      <section className="rounded-xl border border-border p-4">
        {files.length ? (
          <ul className="divide-y divide-border">
            {files.map((file) => {
              const href = safeFileUrl(file.url);
              return (
                <li
                  key={file.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {file.project.name}
                    </p>
                  </div>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center text-sm hover:underline"
                    >
                      Open file
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      File link unavailable
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No files have been shared yet.
          </p>
        )}
      </section>
    </ClientPageFrame>
  );
}
