import { getServiceBySlug } from '@/features/services/server/get-service-by-slug';
import { getVisitorCurrency } from '@/features/services/server/get-visitor-currency';
import { defaultLocale } from '@/i18n/config';
import { emptyBrief } from '@/features/onboarding/lib/project-brief';
import { requireAuth } from '@/features/auth/server/require-auth';
import { uploadsConfigured } from '@/features/onboarding/server/brief-data';
import { ProjectBriefWizard } from '@/features/onboarding/components/ProjectBriefWizard';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Start a project',
  robots: { index: false, follow: false }
};
export default async function StartProjectPage({searchParams}:{searchParams:Promise<{service?:string|string[]}>}) {
  const query=await searchParams;
  const slug=typeof query.service==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(query.service)&&query.service.length<=160?query.service:null;
  const destination=slug?'/start-project?service='+encodeURIComponent(slug):'/start-project';
  const user=await requireAuth(destination);
  const service=slug?await getServiceBySlug(slug,await getVisitorCurrency(),defaultLocale):null;
  const initialBrief=service?{...emptyBrief,title:service.name,notes:'Service of interest: '+service.name+' ('+service.slug+').'}:undefined;
  return <ProjectBriefWizard name={user.name} initialBrief={initialBrief} uploadsEnabled={uploadsConfigured()} />;
}
