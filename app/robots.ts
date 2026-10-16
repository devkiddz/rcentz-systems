import type { MetadataRoute } from 'next';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/admin','/dashboard','/api/','/start-project','/workspace','/login','/register']},sitemap:'https://systems.rcentz.cc/sitemap.xml'};}
