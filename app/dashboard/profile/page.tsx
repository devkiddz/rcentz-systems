import Link from "next/link";
import { requireAuth } from "@/features/auth/server/require-auth";
import { ClientPageFrame } from "@/features/client/components/shell/ClientPageFrame";
import { ClientDetailsForm } from "@/features/client/components/settings/ClientDetailsForm";
export default async function ProfilePage() {
  const user = await requireAuth("/dashboard/profile");
  return (
    <ClientPageFrame
      title="Edit account"
      description="Keep your name, contact number and profile up to date."
    >
      <Link
        href="/dashboard/settings"
        className="inline-flex min-h-11 items-center text-sm underline"
      >
        ← Settings
      </Link>
      <section className="rounded-2xl border border-border bg-card p-5">
        <p className="text-xs text-muted-foreground">Sign-in email</p>
        <p className="mt-2 break-all text-sm font-semibold">{user.email}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {user.emailVerified ? "Verified email" : "Email not verified"} ·{" "}
          {user.status.toLowerCase()}
        </p>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">
          Contact support if you need to change your sign-in email.
        </p>
      </section>
      <ClientDetailsForm
        key={user.id}
        section="account"
        updatedAt={user.updatedAt.toISOString()}
        initial={{
          name: user.name,
          phone: user.phone || "",
          bio: user.bio || "",
        }}
      />
    </ClientPageFrame>
  );
}
