import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {chromium} from 'playwright';
import {lesson03AssetAudit,lesson03Spaces,lesson03SampleImages,lesson03SamplePrompts} from './daejeon-lesson03-assets.mjs';
const root=process.cwd(),out=path.join(root,'review/daejeon/LESSON03_CONTINUOUS_IMPLEMENTATION'),screens=path.join(root,'tmp/lesson03-continuous-implementation/screens');
mkdirSync(out,{recursive:true});mkdirSync(screens,{recursive:true});
const state=JSON.parse(readFileSync(path.join(root,'tmp/day01-implementation/preview.json'),'utf8'));
const base=JSON.parse(readFileSync(path.join(root,'dist/daejeon-2026/review/course-build.json'),'utf8')).basePath;
const origin=process.env.LESSON03_REVIEW_ORIGIN||new URL(state.url).origin,url=origin+base+'/lessons/03/';
const sha=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n').trimEnd();
const report={url,httpStatus:0,sections:[],periodMinutes:[],assets:[],prompts:[],screens:[],pageProtection:[],protection:null,passed:false};
const errors=[],external=[],browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
const page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{if(!r.url().startsWith(origin)&&! /^(blob:|data:)/.test(r.url()))external.push(r.url());});
const overflow=()=>page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('.lesson03-review *')].filter(n=>{if(n.closest('dialog,[aria-hidden="true"]'))return false;const r=n.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1);}).map(n=>({tag:n.tagName,id:n.id,class:n.className})).slice(0,8)}));
const download=async locator=>{const pending=page.waitForEvent('download');await locator.click();const d=await pending;return {name:d.suggestedFilename(),bytes:readFileSync(await d.path())};};
const privateText=/\b(?:S0|S1|B1|B2|S2|SHA|ROI|MAD)\b|DJ-L03|design-pending|instructor-review|pixel diagnostics|generation log|Argon|ChatGPT.*검수|Codex.*검수|[A-Z]:[\\/]|\b[xy]\s*=/i;
try{
  const response=await page.goto(url,{waitUntil:'networkidle'});report.httpStatus=response.status();assert.equal(report.httpStatus,200);
  await page.locator('[data-copy-ready="true"]').first().waitFor({state:'attached'});
  assert.equal(await page.locator('[data-course-status="design-pending"]').count(),1);
  assert.equal(await page.locator('[data-review-status="instructor-review"]').count(),1);
  assert.match(await page.locator('[data-topic-number="3"]').innerText(),/초기 기획을 위한 래피드 콘셉트 도출 및 인페인팅 실무/);
  report.sections=await page.locator('[data-review-section]').evaluateAll(ns=>ns.map(n=>({id:n.id,title:n.querySelector('h2').textContent,minutes:Number(n.dataset.sectionMinutes)})));
  assert.deepEqual(report.sections.map(s=>s.minutes),[5,8,10,10,17,7,10,10,8,15,8,10,20,8,4]);
  report.periodMinutes=await page.locator('[data-period]').evaluateAll(ns=>ns.map(n=>[...n.querySelectorAll('[data-section-minutes]')].reduce((sum,s)=>sum+Number(s.dataset.sectionMinutes),0)));
  assert.deepEqual(report.periodMinutes,[50,50,50]);
  assert.equal(await page.locator('[data-l03-spaces]>.l03-asset-card').count(),5);
  assert.equal(await page.locator('[data-l03-material-defaults]>.l03-asset-card').count(),8);
  assert.equal(await page.locator('[data-l03-material-all] .l03-asset-card').count(),33);
  assert.equal(await page.locator('[data-direction-card],[data-direction-controls],[data-l03-board-download]').count(),0);
  assert.equal(await page.locator('[data-l03-workflow] li').count(),8);
  assert.equal(await page.locator('[data-l03-record]').count(),3);
  assert.equal(await page.locator('[data-l03-comparison]').count(),3);
  assert.equal(await page.locator('.l03-step-context').count(),15);
  assert.match(await page.locator('[data-l03-nontarget-note]').innerText(),/목표 수정은 성공/);
  assert.match(await page.locator('[data-l03-nontarget-note]').innerText(),/회색 좌석 표면 직조/);
  assert.match(await page.locator('[data-l03-proposal-note]').innerText(),/현재 상태.*다음 공간 이미지/s);
  assert.match(await page.locator('[data-l03-palette-note]').innerText(),/팔레트 칩은 유지/);
  assert.match(await page.locator('[data-l03-exterior-next]').innerText(),/Exterior Inpainting과 대안 비교/);
  assert.equal(await page.locator('#l03-recap input,#l03-recap textarea,#l03-recap button').count(),0);
  assert(!/퀴즈|정답|제출|문제/.test(await page.locator('#l03-recap').innerText()));
  assert.match(await page.locator('.l03-session-goal').innerText(),/3회/);
  assert.match(await page.locator('#l03-board-edit-principle').innerText(),/심화 예제.*선택 활동/s);
  assert.match(await page.locator('#l03-new-concept').innerText(),/작은 공간을 구조 기준으로 사용하지 않습니다/);
  assert.deepEqual(await page.locator('[data-l03-meta-prompt],[data-l03-board-prompt],[data-l03-board-edit-prompt],[data-l03-material-all],[data-l03-records]').evaluateAll(ns=>ns.map(n=>n.open)),[false,false,false,false,false]);
  for(const details of await page.locator('.lesson03-review details').all())await details.evaluate(n=>n.open=true);
  await page.locator('.lesson03-review img[src]').evaluateAll(async ns=>{for(const n of ns)n.loading='eager';await Promise.all(ns.map(n=>n.decode()));});
  const text=await page.locator('main').innerText();assert(!privateText.test(text),'Private data in student visible text');
  assert(!/방향 01에 사용할 첫 참고자료|방향 카드 3개|Rapid Concept 세 개|재질 두세 개/.test(text),'Legacy structure retained');
  assert(!/재시도 Prompt|preservation correction|픽셀 좌표/.test(text),'Internal retry guidance leaked');
  const links=await page.locator('.l03-asset-card a[download]').evaluateAll(ns=>ns.map(n=>({url:n.href,name:n.download})));
  const unique=[...new Map(links.map(n=>[n.url,n])).values()];assert.equal(unique.length,47);
  const expected=[...lesson03AssetAudit.filter(a=>a.studentVisible),...lesson03SampleImages];
  for(const link of unique){
    const item=expected.find(a=>origin+base+'/'+a.outputPath===link.url);assert(item,'Unrecognized asset '+link.url);
    const res=await context.request.get(link.url);assert.equal(res.status(),200);assert.equal(sha(await res.body()),item.sha256);
    assert(!/DJ-L03|DJ-ML|M-\d\d/.test(link.name));report.assets.push({url:link.url,sha256:item.sha256,downloadName:link.name});
  }
  for(const opener of await page.locator('[data-l03-image-open]').all()){
    const id=await opener.getAttribute('data-l03-image-open');await opener.click();const dialog=page.locator('[id="'+id+'"]');
    assert.equal(await dialog.evaluate(n=>n.open),true);await dialog.locator('[data-l03-image-size]').click();assert.equal(await dialog.locator('[data-l03-image-size]').getAttribute('aria-pressed'),'true');
    await dialog.locator('[data-l03-image-size]').click();await page.keyboard.press('Escape');assert.equal(await dialog.evaluate(n=>n.open),false);assert.equal(await opener.evaluate(n=>n===document.activeElement),true);
  }
  report.enlargementDialogs=await page.locator('[data-l03-image-open]').count();
  for(let i=0;i<lesson03Spaces.length;i++){
    await page.locator('[data-l03-space-choice]').nth(i).click();assert.equal(await page.locator('[data-l03-base]').inputValue(),lesson03Spaces[i].id);
    assert.match(await page.locator('[data-copy-block-id="l03-my-first-edit"] [data-copy-source]').inputValue(),new RegExp(lesson03Spaces[i].title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
    assert.equal(await page.locator('[data-l03-space-choice][aria-pressed=true]').count(),1);
  }
  await page.locator('[data-l03-space-choice]').first().click();
  await page.locator('[data-l03-target]').fill('리셉션 뒤 지정한 기존 벽면');await page.locator('[data-l03-intent]').fill('한 면의 목무늬로 차분한 인상 살펴보기');
  await page.locator('[data-l03-material]').selectOption('M-21');await page.locator('[data-l03-next-material]').selectOption('M-24');
  const first=await page.locator('[data-copy-block-id="l03-my-first-edit"] [data-copy-source]').inputValue();assert(first.includes('Dark Walnut')&&first.includes('리셉션 뒤 지정한 기존 벽면'));assert(!/\[.*\]/.test(first));
  const final=await page.locator('[data-copy-block-id="l03-my-new-concept"] [data-copy-source]').inputValue();assert(final.includes('Natural Oak'));assert(!/\[.*\]/.test(final));
  for(const text of [first,final])for(const h of ['목적','맥락','입력자료','작업 단계','조건·제한','출력 형식','검토 기준'])assert(text.startsWith(h+'\n')||text.includes('\n'+h+'\n'));
  const blocks=await page.locator('.lesson03-review .review-prompt').all();assert.equal(blocks.length,7);
  for(const block of blocks){
    const source=await block.locator('[data-copy-source]').inputValue();assert(!privateText.test(source));
    await block.locator('[data-copy-trigger]').click();await block.locator('[data-copy-trigger]').filter({hasText:'복사됨'}).waitFor();
    assert.equal(norm(await page.evaluate(()=>navigator.clipboard.readText())),norm(source));
    const downloaded=await download(block.locator('a[download],button[data-download-prompt]'));assert.equal(norm(downloaded.bytes.toString('utf8')),norm(source));assert(!/DJ-L03/.test(downloaded.name));
    report.prompts.push({name:downloaded.name,sha256:sha(downloaded.bytes)});
  }
  for(const item of lesson03SamplePrompts){const res=await context.request.get(origin+base+'/'+item.outputPath);assert.equal(res.status(),200);assert.equal(sha(await res.body()),item.sha256);}
  const served=JSON.parse(readFileSync('dist/daejeon-2026/review/review-assets.json','utf8')).files.filter(f=>f.path.startsWith('practice/DJ-L03/'));
  assert.equal(served.length,12);assert(!served.some(f=>/retry|correction|instructor|log|SHA/i.test(f.path)));
  for(let i=0;i<3;i++)await page.locator('[data-l03-capture="'+i+'"]').click();
  const snapshotPrompt=await page.locator('[data-record-prompt="0"]').inputValue();
  await page.locator('[data-l03-intent]').fill('기록 후 변경한 인상');assert.equal(await page.locator('[data-record-prompt="0"]').inputValue(),snapshotPrompt);
  await page.locator('[data-record-prompt="0"]').fill(snapshotPrompt+'\n실제 실행 메모');
  await page.locator('[data-record-image="0"]').setInputFiles(lesson03Spaces[0].source);
  assert.equal(await page.locator('[data-record-preview="0"]').isVisible(),true);
  for(const [i,status]of ['생성 대기','생성 실패','다시 실행 필요'].entries())await page.locator('[data-record-status="'+i+'"]').selectOption(status);
  await page.locator('[data-record-note="0"]').fill('기록 UI 확인용. 새 이미지를 생성한 것이 아닙니다.');
  const saved=await download(page.locator('[data-l03-records-download]')),records=JSON.parse(saved.bytes);
  assert.equal(records.records.length,3);assert.equal(records.records[0].snapshot.conditions.material,'Dark Walnut');assert.equal(records.records[0].imageFile,lesson03Spaces[0].file);
  assert(records.records[0].executedPrompt.endsWith('실제 실행 메모'));assert.equal(records.records[0].status,'생성 대기');assert(!saved.bytes.toString().includes('data:image'));
  report.recording={snapshotPreserved:true,actualPromptEditable:true,imageFilenameOnly:true,externalUpload:false};
  for(const width of [1440,768,390,320]){
    await page.setViewportSize({width,height:900});await page.evaluate(()=>scrollTo(0,0));await page.evaluate(()=>new Promise(requestAnimationFrame));
    let bounds=await overflow();assert(bounds.width<=width,JSON.stringify(bounds));assert.deepEqual(bounds.offenders,[],JSON.stringify(bounds));
    await page.screenshot({path:path.join(screens,'lesson03-'+width+'-top.png')});
    for(const id of ['l03-space','l03-material','l03-meta','l03-board-demo','l03-compare']){
      await page.locator('#'+id).scrollIntoViewIfNeeded();bounds=await overflow();assert(bounds.width<=width,JSON.stringify(bounds));
      await page.screenshot({path:path.join(screens,'lesson03-'+width+'-'+id+'.png')});
    }
    const opener=page.locator('[data-l03-comparison="board-edit"] [data-l03-image-open]').last();await opener.click();
    const dialog=page.locator('dialog[open]');assert((await overflow()).width<=width);await dialog.locator('[data-l03-image-size]').click();assert((await overflow()).width<=width);await page.keyboard.press('Escape');
    report.screens.push({width,overflow:0,allDetailsExpanded:true,boardEnlargement:true,beforeAfterStacked:width<=900});
  }
  await page.setViewportSize({width:1440,height:900});
  const before=JSON.parse(readFileSync(path.join(out,'browser-before.json'),'utf8'));
  for(const route of Object.keys(before.routes)){
    await page.goto(origin+base+'/'+route,{waitUntil:'networkidle'});
    const current=await page.evaluate(()=>({body:(()=>{const copy=document.body.cloneNode(true);copy.querySelectorAll('script').forEach(n=>n.remove());copy.querySelectorAll('[aria-current="location"]').forEach(n=>n.removeAttribute('aria-current'));return copy.innerHTML;})(),prompts:[...document.querySelectorAll('.review-prompt')].map(n=>({id:n.querySelector('pre')?.id,title:n.querySelector('h3')?.textContent,prompt:n.querySelector('[data-copy-source]')?.value})),links:[...document.querySelectorAll('a[download]')].map(n=>n.href)}));
    assert.equal(sha(Buffer.from(current.body)),sha(Buffer.from(before.routes[route].body)),route+' rendered DOM changed');
    assert.deepEqual(JSON.parse(JSON.stringify(current.prompts)),before.routes[route].prompts,route+' prompts changed');
    assert.deepEqual(current.links,before.routes[route].links,route+' downloads changed');
    report.pageProtection.push({route,domUnchanged:true,promptsUnchanged:true,downloadsUnchanged:true});
  }
  assert.equal((await context.request.get(origin+base+'/lessons/04/')).status(),404);
  const baseline=JSON.parse(readFileSync(path.join(out,'protection-before.json'),'utf8'));
  const allowed=['src/draft/pages/lessons/03.astro','src/draft/content/daejeon-lesson03.ts','src/draft/components/Lesson03Workbench.astro','src/draft/components/Lesson03AssetCard.astro','src/draft/scripts/lesson03-workbench.ts','src/draft/styles/lesson03.css','scripts/daejeon-lesson03-assets.mjs','scripts/build-daejeon-lesson03-review.mjs','scripts/verify-daejeon-lesson03.mjs'];
  const changed=Object.entries(baseline.daejeon).filter(([file,m])=>!existsSync(path.join(root,file))||sha(readFileSync(path.join(root,file)))!==m.sha256).map(([file])=>file);assert(changed.every(f=>allowed.includes(f)),JSON.stringify(changed));
  for(const [file,m] of Object.entries(baseline.gwangju))assert.equal(sha(readFileSync(path.join(root,'../gwangju',file))),m.sha256,'Gwangju changed: '+file);
  const git=(...a)=>execFileSync('git',['--no-optional-locks',...a],{encoding:'utf8'}).trim();
  assert.equal(git('rev-parse','HEAD'),baseline.head);assert.equal(sha(readFileSync(git('rev-parse','--git-path','index'))),baseline.index);
  report.protection={changedExistingFiles:changed,existingSamplesUnchanged:true,existingAssetsUnchanged:true,overviewDay01Day02Unchanged:true,gwangjuUnchanged:true,headUnchanged:true,indexUnchanged:true};
  assert.deepEqual(errors,[],'Browser errors');assert.deepEqual(external,[],'External browser requests');
  report.internalVisibleIds=0;report.passed=true;
}finally{await browser.close();writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({...report,assets:report.assets.length,prompts:report.prompts.length},null,2));
