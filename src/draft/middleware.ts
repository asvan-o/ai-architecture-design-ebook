import {defineMiddleware} from 'astro:middleware';
import {rewriteWorkbookReferences} from '../../scripts/workbook-public-paths.mjs';

export const onRequest=defineMiddleware(async(_context,next)=>{
  const response=await next();
  if(!response.headers.get('content-type')?.includes('text/html'))return response;
  const source=await response.text(),text=rewriteWorkbookReferences(source);
  const headers=new Headers(response.headers);headers.delete('content-length');
  return new Response(text,{status:response.status,statusText:response.statusText,headers});
});
