import { PortfolioIndex } from '@/features/portfolio/components/PortfolioIndex';
import { getPortfolioProjects } from '@/features/portfolio/server/get-portfolio-projects';
import { getResolvedLocale } from '@/features/i18n/server/get-resolved-locale';
export const revalidate = 300;
export default async function PortfolioPage(){const locale=await getResolvedLocale();const projects=await getPortfolioProjects(locale);return <PortfolioIndex projects={projects}/>}
