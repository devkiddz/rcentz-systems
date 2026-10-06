import type { Metadata } from 'next';

import { AuthSplitShell } from '@/features/auth/components/AuthSplitShell';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Create account'
};

export default function RegisterPage() {
  return (
    <AuthSplitShell mode="register">
      <RegisterForm />
    </AuthSplitShell>
  );
}
