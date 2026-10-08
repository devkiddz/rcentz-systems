import { requireAuth } from '@/features/auth/server/require-auth';
import { ProjectBriefWizard } from '@/features/onboarding/components/ProjectBriefWizard';
import { uploadsConfigured } from '@/features/onboarding/server/brief-data';
export default async function DashboardOnboardingPage() {
  const user = await requireAuth('/dashboard/onboarding');
  return (
    <ProjectBriefWizard name={user.name} uploadsEnabled={uploadsConfigured()} />
  );
}
