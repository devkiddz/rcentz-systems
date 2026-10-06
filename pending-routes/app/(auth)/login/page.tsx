import type { Metadata } from 'next';

import { AuthSplitShell } from '@/features/auth/components/AuthSplitShell';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata: Metadata = {
  title: 'Sign in'
};

export default function LoginPage() {
  return (
    <AuthSplitShell mode="login">
      <LoginForm />
    </AuthSplitShell>
  );
}
