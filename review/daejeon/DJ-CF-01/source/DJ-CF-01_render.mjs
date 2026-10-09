import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import { createHash } from 'node:crypto';

const packageRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let repo=path.dirname(fileURLToPath(import.meta.url));
while(!(fs.existsSync(path.join(repo,'package.json'))&&fs.existsSync(path.join(repo,'src/lib/lesson02-ebook.ts'))&&fs.existsSync(path.join(repo,'data/courses')))) {
  const parent=path.dirname(repo);
  if(parent===repo)throw new Error('Repository root not found: package.json, src/lib/lesson02-ebook.ts, data/courses required');
  repo=parent;
}
const outputIndex=process.argv.indexOf('--output-root');
if(outputIndex>=0&&!process.argv[outputIndex+1])throw new Error('--output-root requires a directory');
const root=outputIndex>=0?path.resolve(process.argv[outputIndex+1]):packageRoot;
fs.mkdirSync(root,{recursive:true});
const tmp=outputIndex>=0?path.join(root,'_review'):path.join(repo,'tmp','DJ-CF-01');
fs.mkdirSync(tmp,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--disable-gpu']});
let server;
try {
  const page=await browser.newPage({viewport:{width:1680,height:1188},deviceScaleFactor:2});
  if(process.argv.includes('--plan')) {
  const source=fs.existsSync(path.join(root,'DJ-CF-01_existing-plan.svg'))?root:packageRoot;
  const svg=fs.readFileSync(path.join(source,'DJ-CF-01_existing-plan.svg'),'utf8');
  await page.setContent('<html><body></body></html>');
  const raster=await page.evaluate(async source=>{
    const image=new Image();image.src='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(source)));
    await image.decode();const canvas=document.createElement('canvas');canvas.width=3360;canvas.height=2376;
    canvas.getContext('2d').drawImage(image,0,0,3360,2376);return canvas.toDataURL('image/png').split(',')[1];
  },svg);
  fs.writeFileSync(path.join(root,'DJ-CF-01_existing-plan.png'),Buffer.from(raster,'base64'));
  console.log('Plan rasterized from SVG, 3360 x 2376');
  }
  const review=path.join(root,'DJ-CF-01_review.html');
  if(fs.existsSync(review)) {
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.setViewportSize({width:1360,height:950});
    await page.goto(pathToFileURL(review).href);
    await page.evaluate(async()=>{await Promise.all([...document.images].map(async i=>{i.loading='eager';await i.decode().catch(()=>{});}));});
    await page.screenshot({path:path.join(tmp,'review-desktop.png'),fullPage:true});
    await page.screenshot({path:path.join(tmp,'review-desktop-top.png'),fullPage:false});
    const desktop=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),headings:[...document.querySelectorAll('h2')].map(h=>h.textContent)}));
    await page.locator('#examples').screenshot({path:path.join(tmp,'examples-desktop.png')});
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:path.join(tmp,'review-mobile.png'),fullPage:true});
    await page.screenshot({path:path.join(tmp,'review-mobile-top.png'),fullPage:false});
    const mobile=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)}));
    await page.locator('#examples').screenshot({path:path.join(tmp,'examples-mobile.png')});
    // Test real individual downloads over a temporary loopback-only server.
    server=http.createServer((req,res)=>{
      const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/, '');
      const file=path.resolve(root,relative);
      if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
      const types={'.html':'text/html; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.pdf':'application/pdf','.json':'application/json','.txt':'text/plain; charset=utf-8'};
      res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
      fs.createReadStream(file).pipe(res);
    });
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const localReviewUrl=`http://127.0.0.1:${server.address().port}/DJ-CF-01_review.html`;
    await page.goto(localReviewUrl);
    await page.locator('#downloads details').evaluateAll(elements=>elements.forEach(element=>element.open=true));
    const links=page.locator('#downloads a[download]');
    const downloads=[];
    const hash=b=>createHash('sha256').update(b).digest('hex');
    for(let i=0;i<await links.count();i++){
      const href=await links.nth(i).getAttribute('href');
      console.log('Checking local download: '+href);
      // Check each individual download in a fresh browser context.
      const downloadPage=await browser.newPage({viewport:{width:1360,height:950},acceptDownloads:true});
      try {
        await downloadPage.goto(localReviewUrl);
        await downloadPage.locator('#downloads details').evaluateAll(elements=>elements.forEach(element=>element.open=true));
        const link=downloadPage.locator('#downloads a[download]').nth(i);
        const [download]=await Promise.all([downloadPage.waitForEvent('download'),link.click()]);
        const failure=await download.failure();
        const actual=await download.path();
        const equal=!failure&&hash(fs.readFileSync(actual))===hash(fs.readFileSync(path.join(root,href)));
        downloads.push({file:href,downloadedFilename:download.suggestedFilename(),byteIdentical:equal,failure});
        if(!equal)throw new Error('Download mismatch: '+href);
      } finally {await downloadPage.close();}
    }
    const report={desktop,mobile,errors,downloads};
    fs.writeFileSync(path.join(root,'source','DJ-CF-01_preview-check.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report));
    if(desktop.overflow||mobile.overflow||desktop.broken.length||mobile.broken.length||errors.length)process.exitCode=1;
  }
} finally {await browser.close();if(server)await new Promise(resolve=>server.close(resolve));}
