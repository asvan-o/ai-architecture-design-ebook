import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const packageRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const outputIndex=process.argv.indexOf('--output-root');
if(outputIndex>=0&&!process.argv[outputIndex+1])throw new Error('--output-root requires a directory');
const root=outputIndex>=0?path.resolve(process.argv[outputIndex+1]):packageRoot;
const targets=[['DJ-CF-02_existing-elevation',3360,2376],['DJ-CF-02_site-diagram',1400,1000],['instructor/DJ-CF-02_whitebox-01',1536,1024],['instructor/DJ-CF-02_whitebox-02',1536,1024]];
for(const [name] of targets) {
  if(!fs.existsSync(path.join(root,name+'.svg')))throw new Error(`Missing geometry intermediate ${name}.svg; run DJ-CF-02_geometry.py --output-root ${root} first`);
}
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage();
 for(const [name,w,h] of targets){
  const svg=fs.readFileSync(path.join(root,name+'.svg'),'utf8');
  const png=await page.evaluate(async({svg,w,h})=>{const img=new Image();img.src=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));await img.decode();const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);URL.revokeObjectURL(img.src);return c.toDataURL('image/png').split(',')[1];},{svg,w,h});
  fs.writeFileSync(path.join(root,name+'.png'),Buffer.from(png,'base64'));
 }
} finally {await browser.close();}
console.log('Rasterized four SVG masters');
