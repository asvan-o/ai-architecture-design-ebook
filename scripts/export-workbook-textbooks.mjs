/** Rebuild only the workbook textbooks from the current static student HTML.
 * No generation occurs without --trial or --generate. Legacy Gwangju PDFs and
 * scripts/generate-pdfs.mjs are never read or invoked by this exporter.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {createStaticServer,listen,closeServer,findAvailablePorts} from './lecture-kit-static.mjs';

const repositoryRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const value=(key,fallback)=>{const i=args.indexOf(key);return i<0?fallback:args[i+1];};
assert(!(args.includes('--trial')&&args.includes('--generate')),'Choose --trial or --generate.');
if(!args.includes('--trial')&&!args.includes('--generate')){
 console.log('No files changed. Use --trial [--only overview,02,07,13] for scratch PDFs or --generate for all 14 source PDFs and manifest.\nOptions: --site-dir PATH --work-dir PATH --python PATH --font PATH');
 process.exit(0);
}
const generate=args.includes('--generate');
assert(!generate||!args.includes('--only'),'--generate always exports all 14 textbooks.');
const siteRoot=path.resolve(value('--site-dir',path.join(repositoryRoot,'dist/site/workbook')));
const workRoot=path.resolve(value('--work-dir',path.join(repositoryRoot,'tmp/workbook-textbook-export')));
const bundledPython=path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe');
const python=value('--python',process.env.CODEX_PYTHON||(fs.existsSync(bundledPython)?bundledPython:'python'));
const fontFile=path.resolve(value('--font',process.env.WORKBOOK_PDF_FONT||'C:/Windows/Fonts/malgun.ttf'));
const manifestPath=path.join(repositoryRoot,'src/draft/content/textbook-pdf-manifest.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const access=JSON.parse(fs.readFileSync(path.join(repositoryRoot,'src/config/daejeon-access.json'),'utf8'));
assert.equal(manifest.files.length,14);assert.equal(manifest.courseId,'daejeon-2026');
const build=JSON.parse(fs.readFileSync(path.join(siteRoot,'course-build.json'),'utf8'));
assert.equal(build.courseId,'daejeon-2026');assert.equal(build.mode,'student');
const only=new Set(value('--only','overview,02,07,13').split(','));
const targets=manifest.files.map((file,i)=>({...file,key:i===0?'overview':String(i).padStart(2,'0'),route:i===0?'course-overview':'lessons/'+String(i).padStart(2,'0')})).filter(x=>generate||only.has(x.key));
assert(targets.length>0);assert(fs.existsSync(fontFile),'Korean font file is required.');
fs.mkdirSync(workRoot,{recursive:true});
const stage=path.join(workRoot,generate?'textbooks-final':'textbooks-trial');fs.mkdirSync(stage,{recursive:true});
const css=fs.readFileSync(new URL('./workbook-print.css',import.meta.url),'utf8');
const sha=b=>createHash('sha256').update(b).digest('hex');
const buildMetadataSha256=sha(fs.readFileSync(path.join(siteRoot,'course-build.json')));
const server=createStaticServer(siteRoot,build.basePath),[port]=await findAvailablePorts(1,4650,4699);
await listen(server,port,'127.0.0.1');
const browser=await chromium.launch({headless:true});
const report={schemaVersion:1,mode:generate?'generate':'trial',source:'current static student HTML; no previous textbook pages reused',siteRoot,buildId:build.buildId,format:'A4',marginsMm:{top:18,right:16,bottom:22,left:16},copyrightBaselinePt:31,files:[],passed:false};
try{
 for(const target of targets){
  assert.equal(sha(fs.readFileSync(path.join(siteRoot,'course-build.json'))),buildMetadataSha256,'The static build changed during export.');
  assert(/^[a-z0-9-]+\.pdf$/.test(target.sourceFilename||target.filename),'Unsafe source filename.');
  const page=await browser.newPage({viewport:{width:794,height:1123},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const sourceHtml=path.join(siteRoot,target.route,'index.html');
  // Author-owned static export session uses the existing local access config.
  // The student's website password and every shipped auth file remain unchanged.
  assert(fs.readFileSync(sourceHtml,'utf8').includes(access.passwordHash),'Built HTML access config is stale; rebuild the workbook first.');
  await page.addInitScript(({storageKey,passwordHash})=>sessionStorage.setItem(storageKey,passwordHash),{storageKey:access.sessionStorageKey+':course:'+build.courseId,passwordHash:access.passwordHash});
  assert((await page.goto(`http://127.0.0.1:${port}${build.basePath}/${target.route}/`,{waitUntil:'networkidle'}))?.ok(),target.route);
  assert.equal(await page.locator('html').getAttribute('data-ebook-access'),'unlocked','Author export session must be unlocked.');
  await page.emulateMedia({media:'print'});await page.evaluate(key=>{document.documentElement.dataset.workbookPrintLesson=key;},target.key);await page.addStyleTag({content:css});
  const audit=await page.locator('main').evaluate((main,key)=>{
   const sourceText=main.textContent;
   const details=[...main.querySelectorAll('details')].map(d=>{
    const summary=d.querySelector(':scope > summary')?.textContent.trim()||'';
    const closed=d.hasAttribute('data-implementation-spec')||(key==='07'&&/학습용 상세 지시 구조 참고/.test(summary))||Boolean(d.closest('[data-instructor-reference],.instructor-notes'));
    d.open=!closed;return{summary,open:d.open,reason:closed?'optional implementation/long prompt reference':'learning explanation/reference'};
   });
   main.querySelectorAll('[data-pdf-updated-at],.pdf-version,.pdf-updated-at,.pdf-reference-date').forEach(e=>{e.dataset.workbookPrintOmit='date';e.style.display='none';});
   if(main.textContent!==sourceText)throw Error('Print preparation changed source body text.');
   return{title:main.querySelector('h1').textContent.trim(),details,sourceMainText:sourceText,sections:[...main.querySelectorAll('[data-review-section]')].map(e=>({id:e.id,title:e.querySelector('h2')?.textContent.trim(),minutes:+e.getAttribute('data-section-minutes')||0})),durationMinutes:+main.querySelector('[data-lesson-duration]')?.getAttribute('data-lesson-duration')||null,portfolioPartCount:main.querySelectorAll('[data-portfolio-part]').length,periodMinutes:[...main.querySelectorAll('[data-teaching-minutes]')].map(e=>+e.getAttribute('data-teaching-minutes'))};
  },target.key);
  await page.evaluate(()=>document.fonts.ready);
  // Allow tall prompts to split; keep only genuinely small cards together.
  audit.printSurfaces=await page.locator('main').evaluate(main=>{
   const visible=e=>Boolean(e.getClientRects().length)&&getComputedStyle(e).display!=='none';
   const surfaces=[];
   for(const e of main.querySelectorAll('*')){
    if(!visible(e)||e.matches('img,svg,svg *'))continue;
    const background=getComputedStyle(e).backgroundColor;
    const values=background.match(/[\d.]+/g)?.map(Number);
    if(!values||values.length<3||(values.length>3&&values[3]<.7))continue;
    if(.2126*values[0]+.7152*values[1]+.0722*values[2]<115){
     surfaces.push({className:e.className,originalBackground:background});e.classList.add('workbook-print-dark-surface');
    }
   }
   for(const step of main.querySelectorAll('.l07-sr-step')){
    const paragraph=step.querySelector(':scope > p');
    if(!paragraph||paragraph.getBoundingClientRect().height>180)continue;
    const wrapper=document.createElement('div');wrapper.className='workbook-print-section-intro';step.prepend(wrapper);
    while(wrapper.nextSibling){const child=wrapper.nextSibling;wrapper.append(child);if(child===paragraph)break;}
   }
   // Keep a section heading and its first short learning-context block together.
   // Move existing nodes, including their whitespace, without rewriting text.
   for(const section of main.querySelectorAll('.review-section')){
    const heading=section.querySelector(':scope > .review-section-heading');
    const body=section.querySelector(':scope > .review-section-body');
    const first=body?.firstElementChild;
    if(!heading||!body||!first||first.getBoundingClientRect().height>300)continue;
    const wrapper=document.createElement('div');wrapper.className='workbook-print-section-intro';heading.before(wrapper);
    let node=heading;
    while(node&&node!==body){const next=node.nextSibling;wrapper.append(node);node=next;}
    while(body.firstChild){const child=body.firstChild;wrapper.append(child);if(child===first)break;}
   }
   for(const e of main.querySelectorAll('div,ol,ul')){
    if(!visible(e)||getComputedStyle(e).display!=='grid'||e.classList.contains('review-section-heading'))continue;
    const children=[...e.children].filter(visible);
    if(children.some(c=>c.getBoundingClientRect().height>500)||children.some(c=>c.getBoundingClientRect().width<180&&c.querySelector('img')))e.classList.add('workbook-print-one-column');
   }
   for(const e of main.querySelectorAll('article,aside,details,.review-card,.review-callout,.review-question,.review-task,.lesson02-decision,.l07-note,.l07-sr-note')){
    if(!visible(e))continue;
    const keepHeight=e.matches('article')&&e.querySelector(':scope > img')?880:260;
    e.classList.add(e.getBoundingClientRect().height<keepHeight?'workbook-print-small-card':'workbook-print-large');
   }
   return surfaces;
  });
  audit.images=await page.locator('main img').evaluateAll(async images=>{
   const result=[],cache=new Map();
   for(const img of images){
    if(img.closest('dialog')||!img.getClientRects().length)continue;
    img.loading='eager';await img.decode();if(!img.naturalWidth)throw Error('Missing image '+img.src);
    const source=new URL(img.currentSrc||img.src,location.href);const r=img.getBoundingClientRect();
    const diagram=/\.svg$/i.test(source.pathname)||/floorplan|diagram|workflow|clean.line|existing.plan|existing.elevation|조닝|도면|관계도|선화|평면|단면|입면/i.test(source.pathname);
    const before={src:source.pathname,width:img.naturalWidth,height:img.naturalHeight,displayWidth:r.width,displayHeight:r.height,diagram};
    if(/\.svg$/i.test(source.pathname)){result.push({...before,method:'original SVG'});continue;}
    const maxWidth=Math.max(diagram?1500:650,Math.ceil(r.width*(diagram?3:2.5)));
    const maxHeight=Math.max(diagram?1800:850,Math.ceil(r.height*(diagram?3:2.5)));
    const ratio=Math.min(1,maxWidth/img.naturalWidth,maxHeight/img.naturalHeight);
    const width=Math.max(1,Math.round(img.naturalWidth*ratio)),height=Math.max(1,Math.round(img.naturalHeight*ratio));
    const cacheKey=source.href+'|'+width+'|'+height+'|'+diagram;
    let data=cache.get(cacheKey);
    if(!data){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const c=canvas.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,width,height);c.drawImage(img,0,0,width,height);data=canvas.toDataURL(diagram?'image/png':'image/jpeg',.92);cache.set(cacheKey,data);}
    img.src=data;img.removeAttribute('srcset');await img.decode();
    result.push({...before,exportWidth:width,exportHeight:height,method:diagram?'same diagram pixels at print resolution / PNG':'same reference image at print resolution / JPEG .92'});
   }
   return result;
  });
  for(const image of audit.images){
   const relative=decodeURIComponent(image.src).replace(new RegExp('^'+build.basePath.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'/?'),'');
   const file=path.resolve(siteRoot,relative);assert(file.startsWith(siteRoot+path.sep),image.src);
   if(fs.existsSync(file))image.sourceSha256=sha(fs.readFileSync(file));
  }
  const body=await page.locator('main').evaluate(main=>{
   const visible=e=>Boolean(e.getClientRects().length)&&getComputedStyle(e).display!=='none';
   const blocks=[...main.querySelectorAll('h1,h2,h3,h4,p,li,th,td,pre,figcaption,dt,dd,summary')].filter(visible).filter(e=>!(e.tagName==='LI'&&e.querySelector('p,pre,div,dl,ol,ul,table'))).map(e=>({tag:e.tagName,text:e.innerText.trim()})).filter(e=>e.text.length>=8);
   return{text:main.innerText,blocks,headings:[...main.querySelectorAll('h1,h2,h3')].filter(visible).map(e=>e.innerText.trim()),horizontalOverflow:main.scrollWidth>main.clientWidth+2};
  });
  assert(body.headings.length>=8&&body.blocks.length>=20,target.key+' student body must be unlocked and visible');
  assert(!body.horizontalOverflow,target.key+' print horizontal overflow');
  if(generate&&target.key==='13')assert(audit.durationMinutes===300&&audit.portfolioPartCount===6&&audit.sections.reduce((sum,s)=>sum+s.minutes,0)===300&&/300/.test(body.text),'Lesson 13 must contain the current 300-minute metadata, six Parts and display.');
  if(generate&&target.key==='overview')assert(/2,?400/.test(body.text),'Course overview must contain the current 2400-minute total.');
  assert.equal(await page.locator('main').textContent(),audit.sourceMainText);delete audit.sourceMainText;
  const rawPdf=path.join(stage,target.key+'-html.pdf');
  await page.pdf({path:rawPdf,format:'A4',preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false,tagged:true,outline:false,margin:{top:'18mm',right:'16mm',bottom:'22mm',left:'16mm'}});
  assert.deepEqual(errors,[],target.key+' browser errors');
  const config={key:target.key,title:audit.title,input:rawPdf,output:path.join(stage,target.sourceFilename||target.filename),workRoot:stage,fontFile,copyrightNotice:manifest.copyrightNotice,body,expectedLocalAddresses:['127.0.0.1:8188','localhost:9876'].filter(x=>body.text.includes(x)),userPassword:process.env.WORKBOOK_PDF_PASSWORD||'sando'};
  const configPath=path.join(stage,target.key+'-postprocess.json');fs.writeFileSync(configPath,JSON.stringify(config));
  execFileSync(python,[path.join(repositoryRoot,'scripts/export-workbook-textbooks.py'),configPath],{cwd:repositoryRoot,windowsHide:true,stdio:['ignore','pipe','pipe'],maxBuffer:8*1024*1024});
  const pdfAudit=JSON.parse(fs.readFileSync(path.join(stage,target.key+'-pdf-report.json'),'utf8'));
  assert(pdfAudit.passed,target.key+' PDF QA failed');
  report.files.push({...target,sizeBytes:pdfAudit.sizeBytes,sha256:pdfAudit.sha256,pageCount:pdfAudit.pageCount,encrypted:true,copyrightNoticePages:pdfAudit.copyrightNoticePages,sourceHtml:path.relative(repositoryRoot,sourceHtml).replaceAll('\\','/'),sourceHtmlSha256:sha(fs.readFileSync(sourceHtml)),browser:audit,pdf:pdfAudit});
  fs.writeFileSync(path.join(workRoot,'book-export-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(`${target.key}: ${pdfAudit.pageCount} pages; ${(pdfAudit.sizeBytes/1024/1024).toFixed(2)} MiB; text, footer, link and encryption checks passed`);
  await page.close();
 }
 report.totalSizeBytes=report.files.reduce((n,f)=>n+f.pdf.sizeBytes,0);
 report.totalPages=report.files.reduce((n,f)=>n+f.pdf.pageCount,0);
 assert(report.totalSizeBytes<990_000_000,'The textbook collection exceeds 990 MB.');
 assert.equal(sha(fs.readFileSync(path.join(siteRoot,'course-build.json'))),buildMetadataSha256,'The static build changed during export.');
 if(generate){
  assert.equal(report.files.length,14);
  const destination=path.join(repositoryRoot,'review/daejeon/PDF_TEXTBOOKS');
  const backup=path.join(workRoot,'textbooks-before-clean-export');fs.mkdirSync(backup,{recursive:true});
  for(const item of report.files){
   const name=item.sourceFilename||item.filename,source=path.join(destination,name);
   if(fs.existsSync(source)&&!fs.existsSync(path.join(backup,name)))fs.copyFileSync(source,path.join(backup,name));
  }
  if(!fs.existsSync(path.join(backup,'textbook-pdf-manifest.json')))fs.copyFileSync(manifestPath,path.join(backup,'textbook-pdf-manifest.json'));
  for(const item of report.files){
   fs.copyFileSync(item.pdf.output,path.join(destination,item.sourceFilename||item.filename));
   const entry=manifest.files.find(e=>e.filename===item.filename);
   Object.assign(entry,{sizeBytes:item.pdf.sizeBytes,sha256:item.pdf.sha256,pageCount:item.pdf.pageCount,encrypted:true,copyrightNoticePages:item.pdf.pageCount});
  }
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  report.manifestUpdated=path.relative(repositoryRoot,manifestPath).replaceAll('\\','/');
 }
 report.passed=true;
 fs.writeFileSync(path.join(workRoot,'book-export-report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(`${generate?'Updated 14 textbook sources and manifest':'Trial complete; source PDFs and manifest unchanged'}. Report: ${path.join(workRoot,'book-export-report.json')}`);
}catch(error){
 report.error=error.message;fs.writeFileSync(path.join(workRoot,'book-export-report.json'),JSON.stringify(report,null,2)+'\n');throw error;
}finally{await browser.close();await closeServer(server);}
