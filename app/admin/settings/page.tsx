import { requireAdmin } from '@/features/auth/server/require-admin';
import { ClientAppearanceSettings } from '@/features/client/components/settings/ClientAppearanceSettings';
export default async function Page() {
  const user = await requireAdmin();
  return <main className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6"><h1 className="text-2xl font-semibold">Admin settings</h1><ClientAppearanceSettings /><section className="rounded-2xl border border-border p-5"><h2 className="font-semibold">Account and access</h2><p className="mt-3">{user.name}</p><p className="text-sm text-muted-foreground">{user.email} · {user.role === 'SUPER_ADMIN' ? 'Super administrator' : 'Administrator'}</p><p className="mt-3 text-sm text-muted-foreground">Access is checked against your current account role on the server.</p></section></main>;
}
