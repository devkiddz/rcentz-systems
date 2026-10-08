import { requireAuth } from '@/features/auth/server/require-auth';
import { ClientPageFrame } from '@/features/client/components/shell/ClientPageFrame';
import { ClientAppearanceSettings } from '@/features/client/components/settings/ClientAppearanceSettings';
import { SignOutButton } from '@/features/auth/components/SignOutButton';
export default async function SettingsPage() {
  await requireAuth('/dashboard/settings');
  return (
    <ClientPageFrame
      title="Workspace settings"
      description="Choose your display theme and manage this session."
    >
      <ClientAppearanceSettings />
      <div className="rounded-xl border border-border p-5">
        <p className="text-sm text-muted-foreground">
          Sign out when you finish on a shared device.
        </p>
        <SignOutButton />
      </div>
    </ClientPageFrame>
  );
}
