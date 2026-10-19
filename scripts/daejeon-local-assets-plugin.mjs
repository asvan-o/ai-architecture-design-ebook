import {getDaejeonLocalAssets} from './daejeon-local-assets.mjs';
import path from 'node:path';
const types={'.pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation','.mp4':'video/mp4','.png':'image/png','.jpeg':'image/jpeg','.jpg':'image/jpeg','.svg':'image/svg+xml','.pdf':'application/pdf','.zip':'application/zip','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8','.csv':'text/csv; charset=utf-8','.json':'application/json; charset=utf-8','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
export function daejeonLocalAssetsPlugin(base){
  return {name:'daejeon-local-review-assets',configureServer(server){
    const assets=getDaejeonLocalAssets();
    server.middlewares.use((req,res,next)=>{
      let pathname;try{pathname=decodeURIComponent(new URL(req.url||'/', 'http://localhost').pathname);}catch{next();return;}
      const relative=pathname.startsWith(base+'/')?pathname.slice(base.length+1):pathname.startsWith('/practice/')||/^\/(?:images|downloads)\/daejeon\/lesson-(?:0[789]|1[0-3])\//.test(pathname)?pathname.slice(1):null;
      const asset=relative&&assets.get(relative);if(!asset){next();return;}
      res.statusCode=200;res.setHeader('Content-Type',types[path.extname(asset.path)]||'application/octet-stream');res.setHeader('Content-Length',asset.sizeBytes);res.setHeader('Cache-Control','no-store');res.setHeader('X-Robots-Tag','noindex, nofollow');
      res.end(req.method==='HEAD'?undefined:asset.bytes);
    });
  }};
}
