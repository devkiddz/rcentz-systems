import type { ServiceSummary } from '../server/get-services';
export const catalogueUrl = 'https://systems.rcentz.cc/services';
const types = ['WEBSITE','WEB_APP','MOBILE_APP','DESKTOP_APP','SAAS','API','ECOMMERCE','BRANDING','GRAPHIC_DESIGN','CONSULTING','MAINTENANCE','OTHER'];
const record = (v:unknown):v is Record<string,unknown> => typeof v==='object'&&v!==null&&!Array.isArray(v);
const text = (v:unknown,max:number):v is string => typeof v==='string'&&v.length>0&&v.length<=max;
const slug = (v:unknown):v is string => text(v,160)&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
const priority = ['business-website-development','ecommerce-store-development','client-portal-development','custom-web-application-development','admin-dashboard-development','website-redesign-rebuild'];
export function validateCatalogue(value:unknown):ServiceSummary[] {
 if(!Array.isArray(value)||value.length>250)throw Error('Invalid public service catalogue');
 const seen=new Set<string>(),ids=new Set<string>();
 for(const s of value){
  if(!record(s)||!text(s.id,160)||!text(s.name,180)||!slug(s.slug)||(s.shortDescription!==null&&(typeof s.shortDescription!=='string'||s.shortDescription.length>4000))||typeof s.featured!=='boolean'||!types.includes(String(s.type))||(s.category!==null&&(!record(s.category)||!text(s.category.name,180)||!slug(s.category.slug)))||seen.has(s.slug)||ids.has(s.id))throw Error('Invalid public service catalogue');
  seen.add(s.slug);ids.add(s.id);
 }
 return [...value as ServiceSummary[]].sort((a,b)=>{
  const left=priority.indexOf(a.slug),right=priority.indexOf(b.slug);
  return (left<0?priority.length:left)-(right<0?priority.length:right)||Number(b.featured)-Number(a.featured)||a.name.localeCompare(b.name,'en');
 });
}
export type PreviewKind='website'|'commerce'|'portal'|'dashboard'|'mobile'|'planning';
export function cataloguePresentation(service:ServiceSummary):{kind:PreviewKind;tags:string[]} {
 const value=service.slug;
 if(service.type==='ECOMMERCE'||service.category?.slug==='ecommerce')return {kind:'commerce',tags:['Products','Orders','Customer journeys']};
 if(/portal|client-account/.test(value))return {kind:'portal',tags:['Accounts','Documents','Updates']};
 if(service.type==='WEBSITE')return {kind:'website',tags:['Responsive','Content','Enquiries']};
 if(service.type==='MOBILE_APP'||service.category?.slug==='mobile-adaptive-experiences')return {kind:'mobile',tags:['Mobile experiences','Usability','Navigation']};
 if(service.type==='CONSULTING'||service.type==='MAINTENANCE')return {kind:'planning',tags:['Assessment','Priorities','Next steps']};
 return {kind:'dashboard',tags:['Workflows','Data','Access controls']};
}
export function filterCatalogue(services:ServiceSummary[],query:string,category:string){
 const terms=query.trim().toLocaleLowerCase('en').split(/\s+/).filter(Boolean);
 return services.filter(s=>(category==='all'||s.category?.slug===category)&&terms.every(term=>[s.name,s.shortDescription??'',s.category?.name??'',s.slug.replaceAll('-',' ')].join(' ').toLocaleLowerCase('en').includes(term)));
}
export function catalogueJsonLd(services:ServiceSummary[]){
 return JSON.stringify({'@context':'https://schema.org','@type':'CollectionPage',name:'Rcentz Systems service catalogue',url:catalogueUrl,description:'Websites, commerce and business systems built around your business.',mainEntity:{'@type':'ItemList',itemListElement:services.map((s,i)=>({'@type':'ListItem',position:i+1,name:s.name,url:catalogueUrl+'/'+s.slug}))}}).replace(/</g,'\\u003c');
}
export function serviceProjectHref(slug:string){return '/start-project?service='+encodeURIComponent(slug);}
