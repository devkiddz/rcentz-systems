import { requireAuth } from '@/features/auth/server/require-auth';
import { ProjectBriefWizard } from '@/features/onboarding/components/ProjectBriefWizard';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Start a project',
  robots: { index: false, follow: false }
};
export default async function StartProjectPage() {
  const user = await requireAuth('/start-project');
  return <ProjectBriefWizard name={user.name} />;
}
