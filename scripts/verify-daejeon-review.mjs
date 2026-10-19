import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {chromium} from 'playwright';
import ts from 'typescript';
import {getCourseProfile,getCourseProfiles,validateCourseProfiles,courseOutput} from './course-registry.mjs';
import {verifyDraftOutput} from './draft-output.mjs';
import {reviewOutput,packages,originalPath} from './daejeon-review-assets.mjs';
import {emptyBases,flowerCafe,reusedLesson02Files} from './daejeon-gwangju-reuse.mjs';
import {createStaticServer,listen,closeServer,findAvailablePorts} from './lecture-kit-static.mjs';

const profile=getCourseProfile('daejeon-2026');
assert.equal(profile.course.contentStatus,'design-pending');
assert.deepEqual(profile.course.lessons,[]);
assert.deepEqual(profile.release.releasedStudentLessonIds,[]);
assert.deepEqual(profile.release.releasedPdfLessonIds,[]);
assert.equal(profile.pdfs.policy,'not-issued');
assert.equal(profile.course.reviewDraft.lessons[0].durationMinutes,300);
const invalid=structuredClone(getCourseProfiles());
invalid.find((p)=>p.course.courseId==='daejeon-2026').course.reviewDraft.lessons.push({id:'03',durationMinutes:150});
assert.throws(()=>validateCourseProfiles(invalid),/authorized lesson 01\/02 scope/);
for(const mode of ['student','instructor','pdf-review']) verifyDraftOutput(profile.course,courseOutput(profile.course.courseId,mode));
verifyDraftOutput(profile.course,reviewOutput,{localReviewAssets:true});
const manifest=JSON.parse(readFileSync(path.join(reviewOutput,'review-assets.json'),'utf8'));
for(const p of packages) for(const file of p.assets) {
  assert(readFileSync(originalPath(p.id,file.file)).equals(readFileSync(path.join(reviewOutput,'practice',p.id,file.file))),`Original bytes ${file.file}`);
}
const [port]=await findAvailablePorts(1,4600,4699);
const base=JSON.parse(readFileSync(path.join(reviewOutput,'course-build.json'),'utf8')).basePath;
const server=createStaticServer(reviewOutput,base); await listen(server,port,'127.0.0.1');
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
const report={passed:false,courseStatus:'design-pending',approvedLessons:0,reviewPages:2+profile.course.reviewDraft.lessons.length,periodMinutes:[],breakMinutes:[],assetFiles:manifest.files.length,promptCopies:0,promptDownloads:0,downloadUrls:0,reusedImageDownloads:[],viewports:[],scenarios:[]};
const normalize=(text)=>text.replaceAll('\r\n','\n').trim();
const dayCode=ts.transpileModule(readFileSync('src/draft/content/daejeon-2026.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const day=await import(`data:text/javascript;base64,${Buffer.from(dayCode).toString('base64')}`);
assert.deepEqual(day.periods.map(p=>p.timing.reduce((total,[,minutes])=>total+minutes,0)),[50,50,50,50,50,50]);
mkdirSync('tmp/day01-implementation',{recursive:true});
try {
  const page=await context.newPage(); const errors=[]; page.on('pageerror',(error)=>errors.push(error.message));
  for(const viewport of [{width:1440,height:1000},{width:390,height:844},{width:320,height:740}]) {
    await page.setViewportSize(viewport);
    for(const route of ['/','/course-overview/','/lessons/01/']) {
      const response=await page.goto(`http://127.0.0.1:${port}${base}${route}`); assert(response.ok());
      await page.evaluate(()=>document.fonts.ready);
      assert.equal(await page.locator('main[data-review-status="instructor-review"]').count(),1);
      assert.equal(await page.locator('meta[name=robots]').getAttribute('content'),'noindex, nofollow, noarchive');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${route}: overflow ${viewport.width}`);
      assert(!((await page.locator('main').innerText()).includes('학생')));
      const broken=await page.locator('a[href^="#"]').evaluateAll((links)=>links.filter((link)=>!document.getElementById(link.getAttribute('href').slice(1))).map((link)=>link.getAttribute('href')));
      assert.deepEqual(broken,[]);
      const badBase=await page.locator('a[href^="/"]').evaluateAll((links,base)=>links.filter((link)=>!link.pathname.startsWith(`${base}/`)&&link.textContent.trim()!=='과정 선택').map((link)=>link.pathname),base);
      assert.deepEqual(badBase,[]);
      if(route==='/course-overview/') {
        assert.equal(await page.locator('[data-review-section]').count(),8);
        assert.equal(await page.locator('.review-flow li').count(),10);
        assert.deepEqual(await page.locator('.review-flow strong').allTextContents(),['교육용 실습 예제','요청·조건 이해','디자인 기준 정리','이미지 생성·수정','도면 활용','AI 해석','3D 모델링','법규 확인','독립 교차검증','결과 정리']);
        assert.equal(await page.locator('[data-official-topic]').count(),7);
        assert.equal(await page.locator('.course-roadmap-position').count(),0);
        if(viewport.width===1440) await page.screenshot({path:'tmp/day01-implementation/overview-desktop.png'});
      }
      if(route==='/lessons/01/') {
        assert.equal(await page.locator('[data-review-section]').count(),28);
        assert.equal(await page.locator('#period-1 #course-start').count(),1,'Overview belongs inside period 1');
        assert.equal(await page.locator('.review-toc a').count(),35);
        const minutes=await page.locator('[data-teaching-minutes]').evaluateAll((periods)=>periods.map((p)=>Number(p.dataset.teachingMinutes)));
        assert.deepEqual(minutes,[50,50,50,50,50,50]); report.periodMinutes=minutes;
        assert.equal(await page.locator('[data-timing-minutes]').count(),0,'Detailed operating timings are internal only');
        const breaks=await page.locator('[data-break-minutes]').evaluateAll((breaks)=>breaks.map((b)=>Number(b.dataset.breakMinutes)));
        assert.deepEqual(breaks,[],'Reading pages do not render break schedules');report.breakMinutes=breaks;
        assert.equal(await page.locator('[data-prompt-rule]').count(),7);
        assert.equal(await page.locator('[data-prompt-step]').count(),7);
        assert.equal(await page.locator('[data-analysis-table] tbody tr').count(),10);
        assert.equal(await page.locator('[data-simple-brief] li').count(),10);
        assert.equal(await page.locator('[data-instructor-reference]').count(),0,'No internal references in the shared-screen DOM');
        assert.equal(await page.locator('#period-2 a[href$="RFP-draft.pdf"]').count(),0);
        assert.equal(await page.locator('#period-2 img').count(),8);
        assert.equal(await page.locator('[data-empty-base]').count(),5);
        assert.equal(await page.locator('[data-flower-cafe-comparison] img').count(),2);
        assert.equal(await page.locator('.review-toc-group').count(),6);
        if(viewport.width<1000) {
          assert.equal(await page.locator('.review-toc-group[open]').count(),0);
          await page.locator('.review-toc>details>summary').click();
          await page.locator('[data-toc-period="period-4"]>summary').click();
        }
        await page.locator('.review-toc a[href="#analysis"]').click();
        assert.equal(new URL(page.url()).hash,'#analysis');
        if(viewport.width<1000) assert.equal(await page.locator('.review-toc>details').getAttribute('open'),null);
        await page.goto(`http://127.0.0.1:${port}${base}${route}`);
        await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement.classList.contains('skip-link')));
        await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'main');
        await page.evaluate(()=>document.activeElement.blur());
        if(viewport.width===1440) {
          await page.screenshot({path:'tmp/day01-implementation/day01-desktop.png'});
          await page.locator('#apply').screenshot({path:'tmp/day01-implementation/project-cards.png'});
          // Open references to exercise every real copy/download action, including nested ones.
          await page.locator('main details').evaluateAll((details)=>details.forEach((d)=>d.open=true));
          const blocks=page.locator('prompt-copy-block');
          for(let i=0;i<await blocks.count();i++) {
            const block=blocks.nth(i); const source=await block.locator('[data-copy-source]').inputValue();
            const pre=block.locator('pre code');
            const visible=await pre.count()?await pre.textContent():await block.locator('xpath=..').locator('.annotated-prompt__list p').evaluateAll((parts)=>parts.map((p)=>p.textContent).join('\n\n'));
            assert.equal(source,visible,`Visible/source block ${i}`);
            await block.locator('[data-copy-trigger]').click();
            const clipboard=await page.evaluate(()=>navigator.clipboard.readText());
            // Windows clipboard serializes newlines as CRLF; compare every other character exactly.
            assert.equal(clipboard.replaceAll('\r\n','\n'),source,`Actual clipboard ${i}`); report.promptCopies++;
          }
          const promptWrappers=page.locator('.review-prompt');
          for(let i=0;i<await promptWrappers.count();i++) {
            const wrapper=promptWrappers.nth(i); const source=await wrapper.locator('[data-copy-source]').inputValue();
            const action=wrapper.locator('a[download],button[data-download-prompt]');
            // Realistic click pace also avoids Chromium's burst download throttling.
            await page.waitForTimeout(200);
            const [download]=await Promise.all([page.waitForEvent('download'),action.click()]);
            assert.equal(normalize(readFileSync(await download.path(),'utf8')),normalize(source),`Downloaded prompt ${i}`);report.promptDownloads++;
          }
          await page.locator('img').evaluateAll(async(images)=>{
            for(const img of images) {img.loading='eager';await img.decode();if(!img.naturalWidth)throw new Error(`Broken image ${img.src}`);}
          });
          const downloads=await page.locator('a[download]').evaluateAll((links)=>[...new Set(links.map((link)=>link.href))]);
          for(const url of downloads) {
            const response=await page.request.get(url);assert(response.ok(),url);
            const bytes=await response.body();const relative=decodeURIComponent(new URL(url).pathname).slice(base.length+1);
            const entry=manifest.files.find((file)=>file.path===relative);assert(entry,url);
            assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256);report.downloadUrls++;
          }
          for(const file of [flowerCafe.original,flowerCafe.revised,...emptyBases]) {
            const image=page.locator(`img[src$="/GW-L02/${file.file}"]`).first();
            assert.equal(await image.getAttribute('alt'),file.alt);
            assert((await image.locator('xpath=..').locator('figcaption').innerText()).trim().length>0);
            const url=`http://127.0.0.1:${port}${base}/practice/GW-L02/${file.file}`;
            const response=await page.request.get(url);assert(response.ok());
            assert(response.headers()['content-type'].startsWith('image/jpeg'));
            const [download]=await Promise.all([page.waitForEvent('download'),page.locator(`a[download][href$="/GW-L02/${file.file}"]`).first().click()]);
            const bytes=readFileSync(await download.path()),source=readFileSync(path.join(process.cwd(),file.source));
            assert(bytes.equals(source));assert.equal(download.suggestedFilename(),file.file);
            report.reusedImageDownloads.push({file:file.file,mime:response.headers()['content-type'],sha256:createHash('sha256').update(bytes).digest('hex'),byteIdentical:true,alt:file.alt,caption:true});
          }
          for(const file of reusedLesson02Files) assert(readFileSync(path.join(reviewOutput,'practice/GW-L02',file.file)).equals(readFileSync(path.join(process.cwd(),file.source))));
          await page.locator('[data-example-gate]').screenshot({path:'tmp/day01-implementation/instructor-examples.png'});
          await page.emulateMedia({media:'print'});
          assert.equal(await page.locator('.instructor-notes').count(),0,'No operating notes in print');
          await page.emulateMedia({media:'screen'});
        } else {
          await page.locator('main details').evaluateAll((details)=>details.forEach((d)=>d.open=true));
          assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Expanded mobile overflow ${viewport.width}`);
          await page.locator('#apply').screenshot({path:`tmp/day01-implementation/project-cards-${viewport.width}.png`});
        }
      }
    }
    report.viewports.push(viewport.width);
  }
  assert.equal((await page.request.get(`http://127.0.0.1:${port}${base}/lessons/03/`)).status(),404);
  assert.deepEqual(errors,[]);
  report.scenarios=['six 50-minute periods; breaks outside teaching; overview included','28 sections; 35 TOC targets; keyboard and mobile navigation','7 original rules/formula; 10 analysis and 10 Brief headings','instructor examples closed; no early RFP disclosure','all actual clipboard, TXT downloads, asset SHA and image decode checks','desktop/mobile 1440/390/320 without overflow, including expanded references','design-pending, no approved release/PDFs; separate lesson02 draft allowed; default builds contain no practice assets'];
  report.passed=true;
} finally {await browser.close();await closeServer(server);writeFileSync('tmp/day01-implementation/ui-verification.json',JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report,null,2));
