import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import ts from 'typescript';
import {chromium} from 'playwright';
import {getCourseProfile,getCourseProfiles,validateCourseProfiles,courseOutput} from './course-registry.mjs';
import {verifyDraftOutput} from './draft-output.mjs';
import {reviewOutput} from './daejeon-review-assets.mjs';
import {lesson02Images,lesson02BeforeImages,lesson02MaterialImages,lesson02DefaultMaterialIds} from './daejeon-lesson02-assets.mjs';
import {lesson02ProgramAssets} from './daejeon-file-sorter-assets.mjs';
import {createStaticServer,listen,closeServer,findAvailablePorts} from './lecture-kit-static.mjs';

const profile=getCourseProfile('daejeon-2026');
assert.equal(profile.course.contentStatus,'design-pending');
assert.deepEqual(profile.course.lessons,[]);
assert.deepEqual(profile.release.releasedStudentLessonIds,[]);
assert.deepEqual(profile.release.releasedPdfLessonIds,[]);
assert.equal(profile.pdfs.policy,'not-issued');
assert.deepEqual(profile.course.reviewDraft.lessons,[{id:'01',durationMinutes:300},{id:'02',durationMinutes:150}]);
for(const invalidLessons of [[{id:'02',durationMinutes:150}],[{id:'01',durationMinutes:300},{id:'02',durationMinutes:300}],[{id:'01',durationMinutes:300},{id:'03',durationMinutes:150}],[{id:'01',durationMinutes:300},{id:'01',durationMinutes:150}]]) {
  const invalid=structuredClone(getCourseProfiles());
  invalid.find((p)=>p.course.courseId==='daejeon-2026').course.reviewDraft.lessons=invalidLessons;
  assert.throws(()=>validateCourseProfiles(invalid),/authorized lesson 01\/02 scope/);
}
for(const mode of ['student','instructor','pdf-review']) verifyDraftOutput(profile.course,courseOutput(profile.course.courseId,mode));
verifyDraftOutput(profile.course,reviewOutput,{localReviewAssets:true});
const code=ts.transpileModule(readFileSync('src/draft/content/daejeon-lesson02.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const content=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
assert.deepEqual(content.classificationRules.map((r)=>r.extensions.join(' ')),[
  '.dwg .dxf .dgn .dwf .dwfx', '.rvt .rfa .rte .ifc .ifczip .pln .pla .gsm .skp',
  '.blend .fbx .obj .abc .glb .gltf .3ds .dae .stl .ply .usd .usda .usdc .usdz .3dm .c4d .max .ma .mb .step .stp .iges .igs .sat',
  '.e57 .las .laz .rcp .rcs .pts .pcd', '.doc .docx .hwp .hwpx .txt .md .rtf .odt .ppt .pptx',
  '.mp4 .mov .avi .mkv .webm .m4v', '.xlsx .xls .csv .json .xml .yaml .yml', '.zip .7z .rar .tar .gz .tgz', '.psd .ai .eps .indd',
]);
assert.deepEqual(content.ambiguousExtensions,['.png','.jpg','.jpeg','.webp','.tif','.tiff','.bmp','.gif','.heic','.svg','.pdf']);
assert.deepEqual(content.keywordRules.map((r)=>r.keywords.join(' ')),[
  'floorplan plan elevation section drawing detail cad 평면 평면도 입면 입면도 단면 단면도 도면 상세도',
  'ref reference material texture lighting moodboard mood 재질 텍스처 조명 레퍼런스 무드보드',
  'render output result generated concept selected final 렌더 결과 시안 콘셉트 선택안',
  'rfp brief report proposal contract 제안서 보고서 계약서 브리프',
]);
assert.deepEqual(content.testScenarios.map(([file,folder])=>[file,folder]),[
  ['office_floorplan.png','01_CAD도면'],['front_elevation.pdf','01_CAD도면'],['material_ref_oak.png','03_레퍼런스'],
  ['lighting_ref_3000K.jpg','03_레퍼런스'],['render_A_v01.png','04_이미지결과'],['project_brief.docx','07_문서'],
  ['building_model.blend','05_3D모델'],['animation_cache.abc','05_3D모델'],['walkthrough.mp4','08_영상'],
  ['image001.png','99_분류확인'],['scan003.pdf','99_분류확인'],
]);

const beforeCode=ts.transpileModule(readFileSync('tmp/lesson02-restructure/before/src/draft/content/daejeon-lesson02.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const beforeContent=await import(`data:text/javascript;base64,${Buffer.from(beforeCode).toString('base64')}`);
assert.deepEqual(content.lesson02Topics,beforeContent.lesson02Topics);
assert.equal(content.lesson02Sections.length,15);
assert.equal(content.lesson02Sections.reduce((sum,s)=>sum+s.minutes,0),150);
assert.deepEqual(content.lesson02Periods.map(p=>p.sectionIds.reduce((sum,id)=>sum+content.lesson02Sections.find(s=>s.id===id).minutes,0)),[50,50,50]);
assert(content.planPrompt.includes('아직 만들지는 말고')&&!content.planPrompt.includes('byte-identical'));
assert(content.approvalPrompt.includes('[승인한 계획]')&&content.approvalPrompt.includes('byte-identical')&&content.approvalPrompt.includes('영문 keyword'));
assert(content.testPrompt.includes('직접 실행한 결과')&&content.testPrompt.includes('미검증')&&content.testPrompt.includes('classification test stub'));
assert.deepEqual(content.materialPrompt.match(/^\[([^\]]+)\]$/gm),['[목적]','[맥락]','[입력자료]','[작업 단계]','[조건·제한]','[출력 형식]','[검토 기준]']);
assert(!content.materialPrompt.includes('밝은 오크'));
for(const token of ['[선택한 작업 전 공간]','[선택한 재질]','[적용할 위치]','[Lighting Reference]']){
  assert(content.materialPrompt.includes(token));assert(content.materialExecutionPrompt.includes(token));
}
const manifest=JSON.parse(readFileSync(path.join(reviewOutput,'review-assets.json'),'utf8'));
assert.equal(manifest.files.length,46+lesson02Images.length+lesson02ProgramAssets.length);
assert.equal(lesson02Images.length,44);
const [port]=await findAvailablePorts(1,4600,4699);
const base=JSON.parse(readFileSync(path.join(reviewOutput,'course-build.json'),'utf8')).basePath;
const server=createStaticServer(reviewOutput,base);await listen(server,port,'127.0.0.1');
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
const report={passed:false,status:'design-pending',viewports:[],sections:15,periodMinutes:[50,50,50],teachingMinutes:150,breakMinutes:20,operatingBufferMinutes:10,images:[],promptCopies:0,promptDownloads:0,selectionPromptPassed:false,programRuntimeTested:false};
mkdirSync('tmp/lesson02-restructure',{recursive:true});
try{
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:width===1440?1000:844});
    const response=await page.goto(`http://127.0.0.1:${port}${base}/lessons/02/`);assert(response.ok());
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.locator('main[data-review-status="instructor-review"]').count(),1);
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex, nofollow, noarchive');
    assert.equal(await page.locator('[data-review-section]').count(),15);
    assert.deepEqual(await page.locator('[data-review-section]').evaluateAll(els=>els.map(el=>el.id)),content.lesson02Sections.map(s=>s.id));
    assert.deepEqual(await page.locator('[data-period]').evaluateAll(els=>els.map(el=>[...el.querySelectorAll('[data-section-minutes]')].reduce((sum,item)=>sum+Number(item.dataset.sectionMinutes),0))),[50,50,50]);
    assert.equal(await page.locator('[data-break-minutes]').count(),0,'Reading pages do not render break schedules');
    assert.equal(await page.locator('[data-operating-buffer-minutes]').getAttribute('data-operating-buffer-minutes'),'10');
    assert.equal(await page.locator('[data-period] [data-operating-buffer-minutes]').count(),0);
    assert.equal(await page.locator('.review-toc a').count(),18);
    assert.equal(await page.locator('[data-plan-checks] li').count(),8);
    assert.equal(await page.locator('[data-test-scenarios] tbody tr').count(),11);
    assert.equal(await page.locator('[data-exception-scenarios] tbody tr').count(),11);
    assert.equal(await page.locator('[data-classification-rules] tbody tr').count(),9);
    assert.equal(await page.locator('[data-keyword-rules] tbody tr').count(),4);
    assert.equal(await page.locator('[data-architecture-flow] li').count(),7);
    const allText=await page.locator('main').textContent();
    assert(!/학생|n8n|Dify|광주 과정에서는|대전에서는|신규 실습자료 삽입 예정/.test(allText));
    assert.equal(await page.locator('[data-asset-status="pending"]').count(),0);
    assert.equal(await page.locator('[data-sorter-validation]').count(),1);
    assert.equal(await page.locator('[data-implementation-spec]').evaluate(el=>el.open),false);
    assert.equal(await page.locator('[data-implementation-summary] li').count(),6);
    assert.equal(await page.locator('[data-sorter-steps] li').count(),9);
    assert.equal(await page.locator('[data-sorter-limitations]').count(),1);
    assert(!/실行|内容|内容は|파일은 아직 없습니다|프로그램과 테스트 파일이 제공되지/.test(allText));
    assert.equal(await page.locator('[data-djml-required] li').count(),2);
    assert.equal(await page.locator('[data-djml-recommended] li').count(),2);
    assert.deepEqual(await page.locator('[data-before-gallery] [data-before-id]').evaluateAll(els=>els.map(el=>el.dataset.beforeId)),['01','02','03','04','05']);
    assert.deepEqual(await page.locator('[data-material-defaults] [data-material-id]').evaluateAll(els=>els.map(el=>el.dataset.materialId)),lesson02DefaultMaterialIds);
    assert.equal(await page.locator('[data-material-all] [data-material-id]').count(),33);
    assert.equal(await page.locator('[data-material-all]').evaluate(el=>el.open),false);
    assert.equal(await page.locator('#l02-material-practice [data-l02-image="base"]').count(),1);
    assert((await page.locator('#l02-material-practice [data-l02-image="base"] figcaption').innerText()).includes('검증된 쌍은 아니며'));
    assert.equal(await page.locator('#l02-temperature [data-l02-image="lighting"]').count(),1);
    assert.equal(await page.locator('#l02-temperature [data-l02-image="lighting-reference"]').count(),1);
    assert.equal(await page.locator('[data-l02-image="material"]').count(),0);
    const ids=await page.locator('[id]').evaluateAll(els=>els.map(el=>el.id));assert.equal(new Set(ids).size,ids.length);
    assert.deepEqual(await page.locator('a[href^="#"]').evaluateAll(links=>links.filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash)),[]);
    await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('skip-link')),true);
    await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'main');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Default overflow ${width}`);
    await page.locator('main details').evaluateAll(els=>els.forEach(d=>d.open=true));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Expanded overflow ${width}`);

    const checkCard=async(image,card,download)=>{
      await card.locator(':scope>img').evaluate(async img=>{img.loading='eager';await img.decode();});
      assert.deepEqual(await card.locator(':scope>img').evaluate(img=>[img.naturalWidth,img.naturalHeight]),[image.width,image.height]);
      const opener=card.locator('[data-asset-open]');
      await opener.click();const dialog=card.locator('dialog');assert(await dialog.evaluate(d=>d.open));
      await dialog.locator('[data-asset-size]').click();assert((await dialog.getAttribute('class')).includes('is-original'));
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Dialog overflow ${width}`);
      await dialog.locator('[data-asset-size]').click();await page.keyboard.press('Escape');
      assert.equal(await dialog.evaluate(d=>d.open),false);assert(await opener.evaluate(el=>el===document.activeElement));
      if(download){
        const [result]=await Promise.all([page.waitForEvent('download'),card.locator('a[download]').click()]);
        assert.equal(result.suggestedFilename(),image.file);assert(readFileSync(await result.path()).equals(readFileSync(image.source)));
        const response=await page.request.get(`http://127.0.0.1:${port}${base}/${image.outputPath}`);assert(response.ok());assert(response.headers()['content-type'].startsWith('image/png'));
        assert.equal(createHash('sha256').update(await response.body()).digest('hex'),image.sha256);
        report.images.push({file:image.file,sha256:image.sha256,download:true,zoom:true,byteIdentical:true});
      }
    };
    for(const image of lesson02BeforeImages)await checkCard(image,page.locator(`[data-before-id="${image.id}"]`),width===1440);
    for(const image of lesson02MaterialImages){
      const card=page.locator(`[data-material-all] [data-material-id="${image.id}"]`);
      assert.equal(await card.locator('h4').textContent(),image.name);
      assert.equal(await card.locator('[data-asset-description]').textContent(),image.description);
      assert.equal(await card.getAttribute('data-asset-file'),image.file);
      assert.equal(await card.locator('[data-asset-category]').count(),image.category?1:0);
      if(image.category)assert.equal(await card.locator('[data-asset-category]').textContent(),image.category);
      if(width===1440||image.id==='M-23'||image.id==='M-33')await checkCard(image,card,width===1440);
    }
    for(const image of lesson02Images.filter(image=>['lighting','flow','rules','base','lighting-reference'].includes(image.key))){
      const figure=page.locator(`[data-l02-image="${image.key}"]`);assert.equal(await figure.count(),1);
      await figure.locator(':scope>img').evaluate(async img=>{img.loading='eager';await img.decode();});
      const opener=figure.locator('[data-l02-open]');await opener.click();const dialog=figure.locator('dialog');assert(await dialog.evaluate(d=>d.open));
      await dialog.locator('[data-l02-size]').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      await page.keyboard.press('Escape');assert(await opener.evaluate(el=>el===document.activeElement));
      if(width===1440){
        const [download]=await Promise.all([page.waitForEvent('download'),figure.locator('a[download]').click()]);
        assert.equal(download.suggestedFilename(),image.file);assert(readFileSync(await download.path()).equals(readFileSync(image.source)));
        report.images.push({file:image.file,sha256:image.sha256,download:true,zoom:true,byteIdentical:true});
      }
    }

    if(width===1440){
      const wrappers=page.locator('.review-prompt');assert.equal(await wrappers.count(),6);
      for(let i=0;i<await wrappers.count();i++){
        const wrapper=wrappers.nth(i),source=await wrapper.locator('[data-copy-source]').inputValue();
        await wrapper.evaluate(el=>{const details=el.closest('details');if(details)details.open=true;});
        assert.equal(await wrapper.locator('pre code').textContent(),source);
        await wrapper.locator('[data-copy-trigger]').click();assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).replaceAll('\r\n','\n'),source);report.promptCopies++;
        const [download]=await Promise.all([page.waitForEvent('download'),wrapper.locator('[data-download-prompt]').click()]);
        assert.equal(readFileSync(await download.path(),'utf8').trim(),source.trim());report.promptDownloads++;
      }
    }
    await page.locator('[data-practice-base]').selectOption({label:'BASE 02 · 소형 회의실'});
    await page.locator('[data-practice-material]').selectOption({label:'M-21 Dark Walnut'});
    await page.locator('[data-practice-location]').fill('회의 테이블 뒤 정면 기존 벽면');
    for(const id of ['l02-material-prompt','l02-material-execution-prompt']){
      const wrapper=page.locator(`#${id}`).locator('..').locator('..');
      const source=await wrapper.locator('[data-copy-source]').inputValue();
      assert(source.includes('BASE 02')&&source.includes('M-21 Dark Walnut')&&source.includes('회의 테이블 뒤 정면 기존 벽면'));
      assert(!/\[선택한|\[적용할|\[Lighting/.test(source));
      assert.equal(await wrapper.locator('pre code').textContent(),source);
      if(width===1440){
        await wrapper.locator('[data-copy-trigger]').click();assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).replaceAll('\r\n','\n'),source);report.promptCopies++;
        const [download]=await Promise.all([page.waitForEvent('download'),wrapper.locator('[data-download-prompt]').click()]);
        assert.equal(readFileSync(await download.path(),'utf8').trim(),source.trim());report.promptDownloads++;
      }
    }
    await page.locator('[data-practice-location]').fill('문자 입력 $& 는 그대로');
    assert((await page.locator('#l02-material-prompt').textContent()).includes('문자 입력 $& 는 그대로'));
    await page.locator('[data-practice-location]').fill('');
    assert((await page.locator('#l02-material-prompt').textContent()).includes('[적용할 위치]'));
    report.selectionPromptPassed=true;
    await page.locator('main details').evaluateAll(els=>els.forEach(d=>d.open=false));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Final overflow ${width}`);
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:`tmp/lesson02-restructure/intro-${width}.png`});
    for(const [selector,name] of [['[data-before-gallery]','base'],['[data-material-defaults]','materials'],['#l02-architecture','architecture'],['#l02-plan','natural-request']]){
      await page.locator(selector).screenshot({path:`tmp/lesson02-restructure/${name}-${width}.png`});
    }
    report.viewports.push(width);
  }
  assert.equal((await page.request.get(`http://127.0.0.1:${port}${base}/lessons/03/`)).status(),404);
  assert.deepEqual(errors,[]);report.passed=true;
}finally{await browser.close();await closeServer(server);writeFileSync('tmp/lesson02-restructure/ui-verification.json',JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({...report,images:report.images.length},null,2));
