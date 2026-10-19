import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import ts from 'typescript';

const folder='tmp/day01-readability';
const before=JSON.parse(readFileSync(`${folder}/before.json`,'utf8'));
const renderBefore=JSON.parse(readFileSync(`${folder}/browser-before.json`,'utf8'));
const manifestBefore=JSON.parse(readFileSync(`${folder}/review-assets-before.json`,'utf8'));
const meta=JSON.parse(readFileSync('dist/daejeon-2026/review/course-build.json','utf8'));
const base=`http://127.0.0.1:4700${meta.basePath}`;
const report={passed:false,viewports:[],downloads:0,promptSources:0,officialLinks:[],protection:{}};
const importData=async(file)=>import(`data:text/javascript;base64,${Buffer.from(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText).toString('base64')}`);
const day=await importData('src/draft/content/daejeon-2026.ts');
const oldDay=await importData(`${folder}/before/src/draft/content/daejeon-2026.ts`);
assert.deepEqual(day.periods.map(p=>p.sections),oldDay.periods.map(p=>p.sections));
assert.deepEqual(day.periods.map(p=>p.timing),oldDay.periods.map(p=>p.timing));
assert.deepEqual(day.periods.map(p=>p.timing.reduce((s,[,m])=>s+m,0)),[50,50,50,50,50,50]);
assert.deepEqual(day.sections.map(s=>s.id),oldDay.sections.map(s=>s.id));
const topics=(await importData('src/draft/content/daejeon-lesson02.ts')).lesson02Topics;
const browser=await chromium.launch({headless:true});
try {
  const context=await browser.newContext({acceptDownloads:false});
  await context.addInitScript(()=>{
    Object.defineProperty(navigator,'clipboard',{value:{writeText:async(text)=>{window.__copied=text;}},configurable:true});
    const create=URL.createObjectURL.bind(URL);URL.createObjectURL=(blob)=>{window.__downloadBlob=blob;return create(blob);};
    const click=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(!this.href.startsWith('blob:'))return click.call(this);};
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const beforePrompts=await page.evaluate(html=>{const doc=new DOMParser().parseFromString(html,'text/html');return Object.fromEntries([...doc.querySelectorAll('prompt-copy-block')].filter(el=>!/^DJ-CF-0[12]-example-[AB]$/.test(el.dataset.copyBlockId)).map(el=>[el.dataset.copyBlockId,el.querySelector('[data-copy-source]').value]));},renderBefore['lessons/01'].body);
  for(const width of [1440,390,320]) {
    await page.setViewportSize({width,height:width===1440?1000:844});
    for(const route of ['course-overview','lessons/01']) {
      const response=await page.goto(`${base}/${route}/`,{waitUntil:'load'});assert.equal(response.status(),200);
      await page.evaluate(()=>document.fonts.ready);
      const text=await page.locator('body').textContent();
      assert(!/광주|Gwangju|복습/.test(text),`${route}: reuse/review wording`);
      assert(!/강사 운영|교시 합계|생성 대기가 길면|계정·사용량|제작한 교육용 강사|image_gen|정식 공개·PDF 발행 승인 전/.test(text),`${route}: internal notes`);
      assert.equal(await page.locator('[data-instructor-reference],.instructor-notes,.review-notice').count(),0);
      assert.equal(await page.locator('main[data-course-status="design-pending"][data-review-status="instructor-review"]').count(),1);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route}: ${width} default overflow`);
      const broken=await page.locator('a[href^="#"]').evaluateAll(links=>links.filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash));assert.deepEqual(broken,[]);
      if(route==='course-overview') {
        assert.deepEqual(await page.locator('[data-official-title]').allTextContents(),topics);
        assert.equal(await page.locator('.course-roadmap-position').count(),0);
        assert(!/Portfolio|Project Result Report|실무자료|Astra|GPT 교차검증|NotebookLM|MCP/.test(await page.locator('main').textContent()));
        assert.deepEqual(await page.locator('.review-flow strong').allTextContents(),day.workflow.map(([name])=>name));
        assert((await page.locator('.review-lead').textContent()).includes('교육용 실습 예제'));
      } else {
        assert.equal(await page.locator('[data-review-section]').count(),28);
        assert.deepEqual(await page.locator('[data-period]').evaluateAll(es=>es.map(e=>Number(e.dataset.teachingMinutes))),[50,50,50,50,50,50]);
        assert.equal(await page.locator('[data-prompt-rule]').count(),7);assert.equal(await page.locator('[data-prompt-step]').count(),7);
        const early=await page.locator('#period-1').textContent();assert(!/카페|DJ-CF-01|DJ-CF-02|두 프로젝트/.test(early));
        assert.equal(await page.locator('#projects [data-material-stage="rfp"] article').count(),2);
        assert.equal(await page.locator('h1,h2,h3,h4').filter({hasText:/DJ-CF-0[12]/}).count(),0);
        assert.equal(await page.locator('[data-analysis-table] tbody tr').count(),10);assert.equal(await page.locator('[data-simple-brief] li').count(),10);
        assert.equal(await page.locator('[data-confirmation-status]').count(),1);
        assert.deepEqual(await page.locator('[data-topic-progress] [data-official-title]').allTextContents(),topics.slice(0,2));
        assert(!/1~3교시|4~6교시|중심 진행|대주제 2 진입/.test(await page.locator('[data-topic-progress]').textContent()));
        const flow=await page.locator('#course-start p').first().textContent();assert.equal(flow,day.workflowSummary);
        const ordering=await page.evaluate(()=>{const intro=document.querySelector('[data-flower-cafe-intro]');const walker=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);let cafe=null;while(walker.nextNode()){const n=walker.currentNode;if(n.textContent.includes('카페')){cafe=n;break;}}return cafe&&intro.contains(cafe)&&Boolean(intro.compareDocumentPosition(document.querySelector('#flower-cafe-demo'))&Node.DOCUMENT_POSITION_FOLLOWING);});assert(ordering,'Cafe introduced before examples');
        const sources=await page.locator('prompt-copy-block').evaluateAll(es=>Object.fromEntries(es.map(e=>[e.dataset.copyBlockId,e.querySelector('[data-copy-source]').value])));
        assert.deepEqual(sources,beforePrompts,'All original participant Prompt bodies preserved');report.promptSources=Object.keys(sources).length;
        assert.equal(await page.locator('prompt-copy-block[data-copy-block-id^="DJ-CF-"][data-copy-block-id*="-example-"]').count(),0,'Instructor example Prompt bodies preserved internally only');
        const links=await page.locator('[data-copyright-sources] a').evaluateAll(es=>es.map(e=>({href:e.href,target:e.target,rel:e.rel,text:e.textContent})));
        assert.equal(links.length,3);assert(links.every(e=>e.target==='_blank'&&e.rel.includes('noopener')&&e.text==='공식 원문 보기'));report.officialLinks=links;
        await page.locator('main details').evaluateAll(es=>es.forEach(e=>e.open=true));
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width} expanded overflow`);
        const copy=page.locator('prompt-copy-block').first();const source=await copy.locator('[data-copy-source]').inputValue();await copy.locator('[data-copy-trigger]').click();assert.equal(await page.evaluate(()=>window.__copied),source);
        const dynamic=page.locator('.review-prompt').filter({has:page.locator('[data-download-prompt]')}).first();await dynamic.locator('[data-download-prompt]').click();assert.equal(await page.evaluate(()=>window.__downloadBlob.text()),await dynamic.locator('[data-copy-source]').inputValue());
        await page.emulateMedia({media:'print'});assert.equal(await page.locator('[data-instructor-reference],.instructor-notes,.review-notice').count(),0);await page.emulateMedia({media:'screen'});
        if(width===1440){await page.locator('#types').screenshot({path:`${folder}/information-types-1440.png`});await page.locator('#safety').screenshot({path:`${folder}/copyright-1440.png`});}
      }
      await page.screenshot({path:`${folder}/${route.replace('/','-')}-${width}.png`});
      report.viewports.push({route,width,overflow:false,internalNotes:0,reuseWording:0});
    }
  }
  const r=await page.goto(`${base}/lessons/02/`,{waitUntil:'load'});assert.equal(r.status(),200);
  const lesson02Same=await page.evaluate(old=>{
    const normal=html=>{const doc=new DOMParser().parseFromString(html,'text/html');doc.querySelectorAll('script').forEach(e=>e.remove());return doc.body.innerHTML;};
    return normal(document.querySelector('main').innerHTML)===normal(old);
  },renderBefore['lessons/02'].main);assert(lesson02Same,'Lesson02 full rendered main preserved');report.lesson02RenderedUnchanged=true;
  const manifest=JSON.parse(readFileSync('dist/daejeon-2026/review/review-assets.json','utf8'));assert.deepEqual(manifest,manifestBefore,'Download manifest unchanged');
  for(const file of manifest.files){const response=await page.request.get(`${base}/${file.path}`);assert(response.ok(),file.path);assert.equal(createHash('sha256').update(await response.body()).digest('hex'),file.sha256);report.downloads++;}
  for(const link of report.officialLinks){const response=await page.request.get(link.href,{timeout:30000});assert(response.ok(),link.href);link.status=response.status();}
  assert.deepEqual(errors,[]);await context.close();
} finally {await browser.close();}
const scan=(directory)=>{const result={};const walk=(dir)=>{for(const e of readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules','dist','.astro','tmp'].includes(e.name))continue;const full=path.join(dir,e.name);if(e.isDirectory())walk(full);else if(e.isFile())result[path.relative(directory,full).replaceAll('\\','/')]=createHash('sha256').update(readFileSync(full)).digest('hex');}};walk(directory);return result;};
const current=scan(process.cwd());const changed=Object.keys(before.daejeon).filter(file=>before.daejeon[file]!==current[file]);
const allowed=new Set(['src/draft/pages/course-overview.astro','src/draft/pages/lessons/01.astro','src/draft/content/daejeon-2026.ts','src/draft/layouts/ReviewLayout.astro','src/draft/components/CourseRoadmap.astro','src/draft/components/FlowerCafeDemo.astro','src/draft/components/EmptySpaceMaterials.astro','src/draft/components/ProjectMaterials.astro','scripts/verify-daejeon-review.mjs']);
assert.deepEqual(changed.filter(file=>!allowed.has(file)),[],'Changes outside approved overview/Day01 scope');
assert.deepEqual(scan(path.resolve('../gwangju')),before.gwangju);
assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),before.head);
assert.equal(createHash('sha256').update(readFileSync(execFileSync('git',['rev-parse','--git-path','index'],{encoding:'utf8'}).trim())).digest('hex'),before.index);
report.protection={gwangjuFiles:Object.keys(before.gwangju).length,gwangjuChanged:0,lesson02Changed:0,originalAssetChanged:0,changed,added:Object.keys(current).filter(file=>!(file in before.daejeon)),headAndIndexUnchanged:true};
report.passed=true;writeFileSync(`${folder}/verification.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
