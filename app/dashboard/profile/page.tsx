import { requireAuth } from '@/features/auth/server/require-auth';
import { ClientPageFrame } from '@/features/client/components/shell/ClientPageFrame';
export default async function ProfilePage() {
  const user = await requireAuth('/dashboard/profile');
  return (
    <ClientPageFrame
      title="Your profile"
      description="The account connected to your project workspace."
    >
      <dl className="space-y-4 rounded-xl border border-border p-5">
        {[
          ['Name', user.name],
          ['Email', user.email],
          ['Account status', user.status]
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 break-words text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <a
        href="mailto:contact@rcentz.cc?subject=Account%20update"
        className="inline-flex min-h-11 items-center text-sm hover:underline"
      >
        Contact us to update account details
      </a>
    </ClientPageFrame>
  );
}
