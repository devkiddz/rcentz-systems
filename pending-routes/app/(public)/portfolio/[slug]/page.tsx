import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PortfolioDetail } from '@/features/portfolio/components/detail/PortfolioDetail';
import { getPortfolioProject } from '@/features/portfolio/server/get-portfolio-project';
import { getResolvedLocale } from '@/features/i18n/server/get-resolved-locale';
export const revalidate=300;type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const[{slug},locale,t]=await Promise.all([params,getResolvedLocale(),getTranslations('PortfolioMetadata')]);const project=await getPortfolioProject(slug,locale);if(!project)return{title:t('notFound')};const title=project.seo?.title??`${project.name} | Rcentz Systems`;const description=project.seo?.description??project.summary??project.tagline??project.description??t('fallbackDescription',{project:project.name});return{title,description,keywords:project.seo?.keywords??undefined,alternates:project.seo?.canonicalUrl?{canonical:project.seo.canonicalUrl}:undefined,openGraph:{title:project.seo?.ogTitle??title,description:project.seo?.ogDescription??description,images:project.seo?.ogImage?[{url:project.seo.ogImage}]:project.media[0]?.url?[{url:project.media[0].url}]:undefined}}}
export default async function PortfolioProjectPage({params}:Props){const[{slug},locale]=await Promise.all([params,getResolvedLocale()]);const project=await getPortfolioProject(slug,locale);if(!project)notFound();return <PortfolioDetail project={project}/>}
