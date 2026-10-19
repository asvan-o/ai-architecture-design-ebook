import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {chromium} from 'playwright';
import {automationAssets,automationFiles,automationPrompts,assertAutomationVerified,drawingDemoPath} from './daejeon-automation-ab-assets.mjs';
import {lesson02ProgramAssets} from './daejeon-file-sorter-assets.mjs';
const root=process.cwd(),origin='http://127.0.0.1:4700',base='/ai-architecture-design-ebook/daejeon',url=origin+base+'/lessons/02/';
const out=path.join(root,'review/daejeon/LESSON02_AUTOMATION_AB/instructor'),tmp=path.join(root,'tmp/lesson02-ab');
mkdirSync(out,{recursive:true});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const normalize=text=>text.replaceAll('\r\n','\n').trim();
const report={passed:false,url,sections:[],periodMinutes:[],protectedPages:[],downloads:[],prompts:[],screens:[],protection:{},errors:[],demo:{}};
const browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
const getState=()=>page.evaluate(()=>({body:(()=>{const copy=document.body.cloneNode(true);copy.querySelectorAll('script').forEach(n=>n.remove());copy.querySelectorAll('[aria-current="location"]').forEach(n=>n.removeAttribute('aria-current'));return copy.innerHTML;})(),prompts:[...document.querySelectorAll('.review-prompt')].map(n=>({id:n.querySelector('pre')?.id,title:n.querySelector('h3')?.textContent,prompt:n.querySelector('[data-copy-source]')?.value})),links:[...document.querySelectorAll('a[download]')].map(n=>n.href)}));
const download=async locator=>{const pending=page.waitForEvent('download');await locator.click();const file=await pending;return {name:file.suggestedFilename(),bytes:readFileSync(await file.path())};};
const overflow=()=>page.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('.lesson02-automation *')].filter(n=>{const r=n.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1)&&getComputedStyle(n).visibility!=='hidden';}).map(n=>({tag:n.tagName,id:n.id,class:n.className})).slice(0,15)}));
try {
 assertAutomationVerified();
 const before=JSON.parse(readFileSync(path.join(tmp,'browser-before.json'),'utf8'));
 for(const route of ['course-overview/','lessons/01/','lessons/03/']){
  assert.equal((await page.goto(origin+base+'/'+route)).status(),200);
  const current=await getState();
  assert.equal(current.body,before[route].body,route+' DOM changed');
  assert.deepEqual(JSON.parse(JSON.stringify(current.prompts)),before[route].prompts,route+' prompts changed');
  assert.deepEqual(current.links,before[route].links,route+' downloads changed');
  report.protectedPages.push({route,dom:true,text:true,prompts:true,links:true});
 }
 assert.equal((await page.goto(url)).status(),200);
 assert.equal(await page.locator('[data-course-status="design-pending"]').count(),1);
 assert.equal(await page.locator('[data-review-status="instructor-review"]').count(),1);
 assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/);
 const beforeSections=await page.evaluate(html=>{const doc=new DOMParser().parseFromString(html,'text/html');return [...doc.querySelectorAll('[data-review-section]')].slice(0,7).map(n=>n.outerHTML);},before['lessons/02/'].body);
 const currentSections=await page.evaluate(()=>[...document.querySelectorAll('[data-review-section]')].slice(0,7).map(n=>{const copy=n.cloneNode(true);copy.querySelectorAll('script').forEach(s=>s.remove());return copy.outerHTML;}));
 assert.deepEqual(currentSections,beforeSections,'Section 01–07 changed');report.firstSevenUnchanged=true;
 report.sections=await page.locator('[data-review-section]').evaluateAll(ns=>ns.map(n=>({id:n.id,title:n.querySelector('h2').textContent,minutes:Number(n.dataset.sectionMinutes)})));
 assert.deepEqual(report.sections.map(s=>s.minutes),[12,10,10,18,12,10,10,8,10,10,15,10,10,5]);
 report.periodMinutes=await page.locator('[data-period]').evaluateAll(ns=>ns.map(n=>[...n.querySelectorAll('[data-section-minutes]')].reduce((sum,s)=>sum+Number(s.dataset.sectionMinutes),0)));
 assert.deepEqual(report.periodMinutes,[50,50,50]);
 assert.equal(await page.locator('[data-exercise-card]').count(),2);
 assert.deepEqual(await page.locator('[data-implementation-spec]').evaluateAll(ns=>ns.map(n=>n.open)),[false,false]);
 assert.equal(await page.locator('[data-test-records] tbody tr').count(),11);
 assert(!/design-pending|instructor-review|clean-room|\baudit\b|SHA-256|C:\\Users|Gwangju|광주 과정|강사 운영메모/.test(await page.locator('.lesson02-automation').innerText()),'Internal notes visible');
 const assets=[...automationAssets,...lesson02ProgramAssets];
 const links=await page.locator('.l02-ab a[download]').evaluateAll(ns=>ns.map(n=>({href:n.href,file:n.getAttribute('download')})));
 for(const link of [...new Map(links.map(n=>[n.href,n])).values()]){
  const asset=assets.find(a=>origin+base+'/'+a.outputPath===link.href);assert(asset,'Unknown download: '+link.href);
  const r=await context.request.get(link.href);assert.equal(r.status(),200);assert.equal(sha(await r.body()),asset.sha256);
  report.downloads.push({url:link.href,sha256:asset.sha256,bytes:asset.bytes});
 }
 for(const exercise of ['A','B'])for(const [kind,selector] of [['first','data-first-request'],['approval','data-implementation-spec']]){
  const detail=page.locator('['+selector+'="'+exercise+'"]');await detail.locator('summary').click();assert.equal(await detail.evaluate(n=>n.open),true);
  const prompt=normalize(automationPrompts[exercise][kind]);assert.equal(normalize(await detail.locator('[data-copy-source]').inputValue()),prompt);
  await detail.locator('[data-copy-trigger]').click();assert.equal(normalize(await page.evaluate(()=>navigator.clipboard.readText())),prompt);
  const file=await download(detail.locator('a[download]'));assert.equal(sha(file.bytes),automationFiles[exercise][kind].sha256);
  report.prompts.push({exercise,kind,clipboard:true,download:file.name,sourceIdentical:true});await detail.locator('summary').click();
 }
 for(const exercise of ['A','B'])for(const kind of ['program','test','readme']){
  const file=await download(page.locator('[data-exercise-file="'+exercise+':'+kind+'"]').first());
  const asset=assets.find(a=>a.file===file.name);assert(asset);assert.equal(sha(file.bytes),asset.sha256);
 }
 await page.evaluate(()=>document.querySelectorAll('.l02-ab img').forEach(n=>n.loading='eager'));
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('.l02-ab img')].map(n=>n.decode()));});
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.querySelectorAll('.l02-ab details').forEach(n=>n.open=false));
  const closed=await overflow();assert.equal(closed.scrollWidth,width);assert.equal(closed.offenders.length,0);report.screens.push({...closed,state:'closed'});
  await page.locator('#l02-first-request').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'ebook-'+width+'-examples.png')});
  await page.evaluate(()=>document.querySelectorAll('.l02-ab details').forEach(n=>n.open=true));
  const expanded=await overflow();assert.equal(expanded.scrollWidth,width);assert.equal(expanded.offenders.length,0);report.screens.push({...expanded,state:'expanded'});
  await page.locator('#l02-implementation-spec').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'ebook-'+width+'-spec.png')});
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.evaluate(()=>document.querySelectorAll('.l02-ab details').forEach(n=>n.open=false));
 await page.emulateMedia({media:'print'});assert.equal(await page.locator('[data-implementation-spec] pre').first().isVisible(),false);await page.emulateMedia({media:'screen'});
 const popupEvent=context.waitForEvent('page');await page.locator('[data-drawing-demo]').first().click();const demo=await popupEvent;await demo.waitForLoadState();
 assert.equal(demo.url(),origin+base+'/'+drawingDemoPath);await demo.locator('#load-sample').click();
 const counts=await demo.locator('.summary strong').allTextContents();assert.deepEqual(counts,['29','9','8','4']);
 const csvEvent=demo.waitForEvent('download');await demo.locator('#download-csv').click();const csv=await csvEvent;const bytes=readFileSync(await csv.path());
 assert.equal(sha(bytes),automationFiles.B.csv.sha256);assert.equal(bytes.subarray(0,3).toString('hex'),'efbbbf');
 report.demo={url:demo.url(),sampleCounts:counts,csv:true,csvMatchesVerifiedFile:true};
 for(const file of automationAssets){const r=await context.request.get(origin+base+'/'+file.outputPath);assert.equal(r.status(),200);assert.equal(sha(await r.body()),file.sha256);}
 await demo.close();
 const baseline=JSON.parse(readFileSync(path.join(tmp,'before.json'),'utf8')),sizes=JSON.parse(readFileSync(path.join(tmp,'before-sizes.json'),'utf8'));
 const allowed=new Set(['review/daejeon/FILE_SORTER_STUDENT/DJ-L02_FILE_SORTER_MANIFEST.json','review/daejeon/FILE_SORTER_STUDENT/DJ-L02_FILE_SORTER_PROGRAM.zip','review/daejeon/FILE_SORTER_STUDENT/DJ-L02_FILE_SORTER_README.txt','review/daejeon/FILE_SORTER_STUDENT/DJ-L02_SORT_TEST.zip','scripts/build-daejeon-day01-review.mjs','scripts/draft-output.mjs','src/draft/content/daejeon-lesson02-automation.ts','src/draft/pages/lessons/02.astro']);
 const changed=[],unchanged=[];
 for(const [file,hash] of Object.entries(baseline.daejeon)){
  assert(existsSync(path.join(root,file)),'Deleted baseline file '+file);const bytes=readFileSync(path.join(root,file));
  if(sha(bytes)!==hash){assert(allowed.has(file),'Protected file changed: '+file);changed.push(file);}else {if(sizes.daejeon?.[file])assert.equal(bytes.length,sizes.daejeon[file].bytes);unchanged.push(file);}
 }
 for(const [file,hash] of Object.entries(baseline.gwangju)){const target=path.join(root,'../gwangju',file);assert(existsSync(target),'Gwangju deleted '+file);const bytes=readFileSync(target);assert.equal(sha(bytes),hash,'Gwangju changed '+file);if(sizes.gwangju?.[file])assert.equal(bytes.length,sizes.gwangju[file].bytes);}
 const listFiles=directory=>readdirSync(directory,{withFileTypes:true}).filter(entry=>!['.git','node_modules','dist','.astro','tmp'].includes(entry.name)).flatMap(entry=>entry.isDirectory()?listFiles(path.join(directory,entry.name)):[path.join(directory,entry.name)]);
 assert.deepEqual(listFiles(path.join(root,'../gwangju')).map(file=>path.relative(path.join(root,'../gwangju'),file).replaceAll('\\','/')).sort(),Object.keys(baseline.gwangju).sort(),'New or removed Gwangju file');
 const git=(...args)=>execFileSync('git',['--no-optional-locks',...args],{encoding:'utf8'}).trim();assert.equal(git('rev-parse','HEAD'),baseline.head);assert.equal(sha(readFileSync(git('rev-parse','--git-path','index'))),baseline.index);
 report.protection={baselineDaejeon:Object.keys(baseline.daejeon).length,unchanged:unchanged.length,changedWithinScope:changed,gwangjuUnchanged:Object.keys(baseline.gwangju).length,headUnchanged:true,indexUnchanged:true};
 assert.deepEqual(report.errors,[]);report.passed=true;
} finally {await browser.close();writeFileSync(path.join(out,'ebook-verification.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({passed:report.passed,sections:report.sections.length,times:report.periodMinutes,downloads:report.downloads.length,screens:report.screens,protection:report.protection},null,2));
