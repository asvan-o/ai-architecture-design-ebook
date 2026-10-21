import type {APIRoute} from 'astro';
import {readFileSync,statSync} from 'node:fs';
import path from 'node:path';

// Dev-only access to the existing approved PDF bytes. No new PDFs are generated.
// Production builds continue using the original asset packaging pipeline.
const names=['ai-architecture-design-daejeon-course-overview.pdf',...Array.from({length:13},(_,i)=>`ai-architecture-design-daejeon-lesson-${String(i+1).padStart(2,'0')}.pdf`)];
export function getStaticPaths(){return import.meta.env.DEV?names.map(filename=>({params:{filename:filename.replace(/\.pdf$/,'')}})):[];}
function pdfFile(filename:string|undefined){const name=filename+'.pdf';return import.meta.env.DEV&&filename&&names.includes(name)?path.join(process.cwd(),'review','daejeon','PDF_TEXTBOOKS',name):null;}
function headers(filename:string,file:string){return {'Content-Type':'application/pdf','Content-Length':String(statSync(file).size),'Content-Disposition':`attachment; filename="${filename}"`,'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};}
export const GET:APIRoute=({params})=>{const file=pdfFile(params.filename);if(!file||!params.filename)return new Response(null,{status:404});return new Response(new Uint8Array(readFileSync(file)),{headers:headers(params.filename+'.pdf',file)});};
export const HEAD:APIRoute=({params})=>{const file=pdfFile(params.filename);if(!file||!params.filename)return new Response(null,{status:404});return new Response(null,{headers:headers(params.filename+'.pdf',file)});};
