import fs from 'node:fs';import assert from 'node:assert/strict';import{createHash}from'node:crypto';import{chromium}from'playwright';
import{getDaejeonLocalAssets}from'./daejeon-local-assets.mjs';
const dir='review/daejeon/EBOOK_LEARNER_LANGUAGE';fs.mkdirSync(dir+'/screenshots',{recursive:true});
const forbidden=/강사|수강생|휴식|BREAK|[0-9]+분|교시|18:00|10:00|18:50|19:50|20:50|2026-10-|design-pending|instructor-review|review\/draft|image_gen|Reviewer|원본과 동일한 파일|소급 설명|[\u3040-\u30FF]/;
const schedule=/\b\d{1,2}:\d{2}\b|\d+\s*시간|\d+\s*분(?!류)|시간이 허용되면/;
const routes=['','course-overview/',...['01','02','03','04','05','06','07','08'].map(id=>'lessons/'+id+'/')];
const appendStructure='review/daejeon/DJ-L07-PART2-FLOORPLAN-GRAPHVIZ-APPEND/revision-3/structure-expected.json';
const priorStructure=JSON.parse(fs.readFileSync(fs.existsSync(appendStructure)?appendStructure:dir+'/structure-before.json','utf8'));
const structure=[...priorStructure.filter(row=>row.route!=='lessons/07/'),
 {route:'lessons/07/',sectionIds:['l07-recap','l07-mesh-vs-gs','l07-gs-role','l07-comfyui-env','l07-gs-practice','l07-gs-inspection','l07-render-bridge','l07-five-routes','l07-render-compare','l07-render-prompt','l07-partial-fix','l07-upscale-principle','l07-comfyui-upscale','l07-openvino-sr1033','l07-final-check','l07-handover'],minutes:[15,20,15,25,15,10,15,20,15,25,25,20,30,30,15,5].map(String),parts:Array.from({length:6},(_,i)=>({id:'l07-part-'+(i+1),minutes:'50'})),topics:['메인-서브 통합 워크플로우 및 2D 역추출 브릿지 실습']},
 {route:'lessons/08/',sectionIds:['l08-plan-prep-why','l08-notebooklm-plan','l08-clean-line-criteria','l08-spatial-validation','l08-graphviz-diagram','l08-part2-handover'],minutes:[20,30,25,25,30,20].map(String),parts:Array.from({length:3},(_,i)=>({id:'l08-part-'+(i+1),minutes:'50'})),topics:['실무 데이터셋 전처리 및 2D 도면 기반 3D 시각화 기초']},
];
const appendedForbidden=/Gwangju|광주|14차시|42시간|승인본|검수본|초안/;
const lessonTitleSources=[['src/draft/content/daejeon-2026.ts','lessonTitle'],...['02','03','04','05','06','07','08'].map(id=>['src/draft/content/daejeon-lesson'+id+(id==='02'?'-automation':'')+'.ts','lesson'+id+'Title'])];
const lessonTitles=lessonTitleSources.map(([file,key])=>{const match=fs.readFileSync(file,'utf8').match(new RegExp('export const '+key+"\\s*=\\s*'([^']*)'"));assert(match,'Missing lesson title '+file);return match[1];});
const roadmapLinks=[['제1차시 전반부'],['제1차시 후반부','제2차시'],['제3차시','제4차시','제5차시'],['제6차시','제7차시'],['제8차시'],['후속 차시 예정'],['후속 차시 예정']];
const topicStates=[['대주제 1 · 완결','대주제 2 · 시작'],['대주제 2 · 완결'],['대주제 3 · 시작'],['대주제 3 · 계속'],['대주제 3 · 완결'],['대주제 4 · 시작'],['대주제 4 · 완결'],['대주제 5 · 시작']];
const assets=getDaejeonLocalAssets(),sha=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n').trim();
const servers=[{name:'dev',origin:'http://localhost:4321',base:'/daejeon'},{name:'preview',origin:'http://127.0.0.1:4700',base:'/ai-architecture-design-ebook/daejeon'}];
const report={passed:false,forbiddenPattern:forbidden.source,scans:[],pages:[],downloads:[],assetChecks:[],promptDownloads:[],dynamicChecks:[],errors:[]};
const browser=await chromium.launch({headless:true});
try{
 for(const server of servers){
  const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
  const page=await context.newPage(),pageErrors=[],checked=new Map();page.on('pageerror',e=>pageErrors.push(e.message));
  const scan=async(route,state,width)=>{
   const text=await page.locator('main').innerText(),matches=text.split('\n').filter(s=>forbidden.test(s)||schedule.test(s));
   const tocText=await page.locator('.review-toc').count()?await page.locator('.review-toc').innerText():'';
   assert(!forbidden.test(tocText)&&!schedule.test(tocText),'TOC language '+route);
   const scroll=await page.evaluate(()=>document.documentElement.scrollWidth);
   report.scans.push({server:server.name,route,state,width,forbiddenMatches:matches,scroll});
   if(['lessons/07/','lessons/08/'].includes(route)){assert(!appendedForbidden.test(text),'Append language '+text.match(appendedForbidden));assert(!appendedForbidden.test(tocText),'Append TOC language');}
   assert.deepEqual(matches,[],server.name+' '+route+' '+state+' '+width+': '+matches.join('\n'));
   assert(scroll<=width+1,'Overflow '+server.name+' '+route+' '+width);
  };
  for(const route of routes){
   const response=await page.goto(server.origin+server.base+'/'+route,{waitUntil:'networkidle'});assert.equal(response.status(),200,route);
   assert.equal(await page.locator('main[data-course-status="design-pending"][data-review-status="instructor-review"]').count(),1);
   assert.equal(await page.locator('meta[name=robots]').getAttribute('content'),'noindex, nofollow, noarchive');
   assert.equal(await page.locator('[data-lesson-schedule],[data-break-minutes],.review-notice').count(),0);
   const before=structure.find(p=>p.route===route),after=await page.evaluate(()=>({sectionIds:[...document.querySelectorAll('[data-review-section]')].map(e=>e.id),minutes:[...document.querySelectorAll('[data-review-section]')].map(e=>e.getAttribute('data-section-minutes')),parts:[...document.querySelectorAll('[data-period],.day-period[data-teaching-minutes]')].map(e=>({id:e.id,minutes:e.getAttribute('data-teaching-minutes')})),topics:[...document.querySelectorAll('[data-official-title]')].map(e=>e.textContent)}));
   assert.deepEqual(after,{sectionIds:before.sectionIds,minutes:before.minutes,parts:before.parts,topics:before.topics},'Section/metadata/topic preservation '+route);
   if(route==='')assert.deepEqual(await page.locator('[data-course-lesson-card] h2').allTextContents(),['COURSE OVERVIEW',...lessonTitles],'Home title bindings/order');
   if(route==='course-overview/'){
    assert.deepEqual(await page.locator('[data-overview-lesson-grid] h2').allTextContents(),lessonTitles,'Overview title bindings/order');
    for(let index=0;index<8;index++)assert.equal(await page.locator('[data-lesson'+String(index+1).padStart(2,'0')+'-overview-card]').count(),1);
    for(let index=0;index<7;index++)assert.deepEqual(await page.locator('[data-official-topic="'+(index+1)+'"] [data-topic-lesson-links]>*').allTextContents(),roadmapLinks[index]);
    assert.equal(await page.locator('.course-roadmap-position').count(),0);
   }
   if(route.startsWith('lessons/')){
    const index=Number(route.split('/')[1])-1;
    assert.equal(await page.locator('main h1').textContent(),lessonTitles[index],'Page title binding '+route);
    assert.deepEqual(await page.locator('[data-topic-progress] [data-topic-number]>p:first-child').allTextContents(),topicStates[index],'Topic stage '+route);
    if(index>=1&&index<=3)assert((await page.locator('.topic-progress-note').innerText()).trim().length>0,'Topic note '+route);
    if(index===6){assert.equal(await page.locator('[data-lesson07-revision]').getAttribute('data-lesson07-revision'),'DJ-L07-GAUSSIAN-UPSCALE/revision-1');assert.equal(after.sectionIds.length,16);assert.equal(after.parts.length,6);}
    if(index===7){assert.equal(after.sectionIds.length,6);assert.equal(after.parts.length,3);}
   }
   const links=['홈','과정 안내',...['01','02','03','04','05','06','07','08'].map(id=>'제'+Number(id)+'차시')];
   for(const selector of['.review-header nav a','[data-review-course-nav] ol a'])assert.deepEqual(await page.locator(selector).allTextContents(),links);
   for(const width of[1440,390,320]){await page.setViewportSize({width,height:1000});await scan(route,'default',width);await page.screenshot({path:dir+'/screenshots/'+server.name+'-'+(route||'home').replaceAll('/','-')+width+'.png'});}
   await page.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
   for(const width of[1440,390,320]){await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));await scan(route,'expanded',width);}
   await page.setViewportSize({width:1440,height:1000});
   await page.evaluate(()=>document.querySelectorAll('img').forEach(i=>i.loading='eager'));
   await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0),{},{timeout:30000});
   const images=await page.locator('img').evaluateAll(ns=>ns.map(i=>({src:i.currentSrc||i.src,naturalWidth:i.naturalWidth,modal:!!i.closest('dialog')})));
   const modals=await page.evaluate(()=>{const results=[];for(const b of document.querySelectorAll('button[aria-haspopup="dialog"]')){const pair=Object.entries(b.dataset).find(([k])=>/Open$/.test(k));if(!pair)continue;const d=document.getElementById(pair[1]);if(!(d instanceof HTMLDialogElement))continue;b.click();results.push({id:d.id,open:d.open,images:[...d.querySelectorAll('img')].every(i=>i.naturalWidth>0)});d.close();}return results;});assert(modals.every(d=>d.open&&d.images));
   const downloads=await page.locator('a[download]').evaluateAll(ns=>ns.map(a=>({url:a.href,label:a.textContent.trim()})));
   for(const link of downloads){if(!checked.has(link.url)){const r=await page.request.get(link.url);assert.equal(r.status(),200,link.url);const bytes=await r.body();assert(bytes.length>0);const key=decodeURIComponent(new URL(link.url).pathname).slice(server.base.length+1),asset=assets.get(key);if(asset)assert.equal(sha(bytes),asset.sha256,link.url);checked.set(link.url,{status:200,size:bytes.length,sha256:sha(bytes)});await r.dispose();}report.downloads.push({server:server.name,route,...link,...checked.get(link.url)});}
   const blocks=await page.locator('.review-prompt').evaluateAll(ns=>ns.map(n=>({id:n.querySelector('[data-copy-block-id]')?.getAttribute('data-copy-block-id'),text:n.querySelector('[data-copy-source]')?.value,display:n.querySelector('pre code')?.textContent})));
   for(const block of blocks){assert.equal(block.text,block.display,block.id);assert(!forbidden.test(block.text),block.id+' prompt language');}
   const copy=page.locator('[data-copy-trigger]');if(await copy.count()){await copy.first().click();await page.waitForFunction(()=>document.querySelector('[data-copy-trigger]')?.textContent?.includes('복사됨'));}
   const dynamic=page.locator('[data-download-prompt]');
   if(await dynamic.count()){
    const button=dynamic.first(),expected=await button.locator('xpath=..').locator('[data-copy-source]').inputValue();
    const [download]=await Promise.all([page.waitForEvent('download'),button.click()]);assert.equal(await download.failure(),null);assert.equal(norm(fs.readFileSync(await download.path(),'utf8')),norm(expected));
    report.promptDownloads.push({server:server.name,route,filename:download.suggestedFilename(),matchesDisplayedText:true});
    // Exercise every dynamic TXT button with its actual Blob while avoiding browser burst download throttling.
    const generated=await page.evaluate(async()=>{const originalCreate=URL.createObjectURL,originalClick=HTMLAnchorElement.prototype.click,records=[];let blob;
     URL.createObjectURL=function(value){blob=value;return originalCreate.call(this,value);};HTMLAnchorElement.prototype.click=function(){if(!this.href.startsWith('blob:'))return originalClick.call(this);};
     try{for(const button of document.querySelectorAll('[data-download-prompt]')){button.click();const expected=button.closest('.review-prompt').querySelector('[data-copy-source]').value;records.push({filename:button.getAttribute('data-download-prompt'),matches:await blob.text()===expected});}}finally{URL.createObjectURL=originalCreate;HTMLAnchorElement.prototype.click=originalClick;}return records;});
    assert(generated.every(r=>r.matches));report.promptDownloads.push(...generated.map(r=>({server:server.name,route,...r})));
   }
   if(route==='lessons/03/'){await page.locator('[data-l03-base]').selectOption({index:1});await page.locator('[data-l03-material]').selectOption('M-24');await page.locator('[data-l03-next-material]').selectOption('M-21');await scan(route,'changed selection',1440);report.dynamicChecks.push({server:server.name,route,clean:true});}
   if(route==='lessons/04/'){for(const index of[1,2,0]){await page.locator('[data-l04-base]').selectOption({index});await scan(route,'changed base '+index,1440);}report.dynamicChecks.push({server:server.name,route,clean:true});}
   if(route==='lessons/05/'){for(const id of['PLAN-BASE-02','PLAN-BASE-01']){await page.locator('[data-l05-plan]').selectOption(id);await scan(route,'changed plan '+id,1440);}for(const value of['0','100','50']){await page.locator('[data-overlay-opacity]').fill(value);assert.equal(await page.locator('[data-overlay-layer]').evaluate(n=>n.style.opacity),String(Number(value)/100));}report.dynamicChecks.push({server:server.name,route,clean:true});}
   const ids=await page.evaluate(()=>[...document.querySelectorAll('[id]')].map(n=>n.id));assert.equal(new Set(ids).size,ids.length);
   report.pages.push({server:server.name,route,images,modals,staticDownloads:downloads.length,promptBlocks:blocks.length,structurePreserved:true});console.log(server.name+' '+(route||'home')+' PASS');
  }
  for(const[key,asset]of assets){const url=server.origin+server.base+'/'+key;if(!checked.has(url)){const r=await page.request.get(url);assert.equal(r.status(),200,url);const bytes=await r.body();assert.equal(sha(bytes),asset.sha256,url);checked.set(url,{status:200,size:bytes.length,sha256:sha(bytes)});await r.dispose();}report.assetChecks.push({server:server.name,path:key,...checked.get(url)});}
  assert.deepEqual(pageErrors,[]);await context.close();
 }
 report.passed=true;
}catch(e){report.errors.push(e.stack);throw e;}finally{await browser.close();fs.writeFileSync(dir+'/browser-validation.json',JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({passed:report.passed,pages:report.pages.length,scans:report.scans.length,forbiddenMatches:report.scans.reduce((n,r)=>n+r.forbiddenMatches.length,0),downloads:report.downloads.length,assetChecks:report.assetChecks.length,promptDownloads:report.promptDownloads.length}));
