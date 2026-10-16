import type { MetadataRoute } from 'next';
import { getServices } from '@/features/services/server/get-services';
import { validateCatalogue, catalogueUrl } from '@/features/services/lib/catalogue';
// Generate on request so builds do not require a running API server.
export const dynamic = 'force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const services=validateCatalogue(await getServices());
 const base='https://systems.rcentz.cc';
 return [...['','/services','/solutions','/how-we-work','/remote-delivery','/tools','/pricing'].map(path=>({url:base+path})),...services.map(s=>({url:catalogueUrl+'/'+s.slug}))];
}
