import type { Metadata } from 'next';
import type { ServiceDetail } from '../server/get-service-by-slug';
import { catalogueUrl } from './catalogue';
function secureUrl(value:string|null|undefined){try{const u=new URL(value??'');return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}}
export function serviceMetadata(service:ServiceDetail):Metadata {
 const title=service.seo?.title||`${service.name} | Rcentz Systems`;
 const description=service.seo?.description||service.shortDescription||service.description||`Explore ${service.name} from Rcentz Systems.`;
 const canonical=secureUrl(service.seo?.canonicalUrl)||catalogueUrl+'/'+service.slug;
 const robots=(service.seo?.robots??'index,follow').toLowerCase().split(/[\s,]+/);
 const image=secureUrl(service.seo?.ogImage);
 return {title:{absolute:title},description,alternates:{canonical},robots:{index:!robots.includes('noindex')&&!robots.includes('none'),follow:!robots.includes('nofollow')&&!robots.includes('none')},openGraph:{title:service.seo?.ogTitle||title,description:service.seo?.ogDescription||description,url:canonical,type:'website',siteName:'Rcentz Systems',...(image?{images:[image]}:{})},twitter:{card:image?'summary_large_image':'summary',title,description,...(image?{images:[image]}:{})}};
}
export function serviceJsonLd(service:ServiceDetail){
 const url=catalogueUrl+'/'+service.slug;
 return JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'Service','@id':url+'#service',name:service.name,description:service.shortDescription||service.description||undefined,url,provider:{'@type':'Organization',name:'Rcentz Systems',url:'https://systems.rcentz.cc'}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:'https://systems.rcentz.cc'},{'@type':'ListItem',position:2,name:'Services',item:catalogueUrl},{'@type':'ListItem',position:3,name:service.name,item:url}]}]}).replace(/</g,'\\u003c');
}
