import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import{createHash}from'node:crypto';import ts from 'typescript';
const read=p=>fs.readFileSync(p,'utf8');
const bandabiAllowed=new Set(JSON.parse(read('src/draft/content/lesson10-bandabi-materials.json')).items.map(i=>'downloads/daejeon/lesson-10/'+i.file));
const load=async p=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(read(p),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64'));
const original10=await load('src/lib/lesson10-grounded-legal-review.ts'),original11=await load('src/lib/lesson11-legal-cross-validation.ts');
const copied10=await load('src/draft/content/gwangju-legal/lesson10-grounded-legal-review.ts'),copied11=await load('src/draft/content/gwangju-legal/lesson11-legal-cross-validation.ts');
const promptGuides=JSON.parse(read('src/draft/content/lesson10-prompt-guides.json'));
const map=JSON.parse(read('src/draft/content/lesson10-grounded-map.json'));
test('Daejeon uses byte-identical canonical legal data; no project or law source is reinvented',()=>{
 for(const file of ['lesson10-grounded-legal-review.ts','lesson11-legal-cross-validation.ts'])assert(fs.readFileSync('src/lib/'+file).equals(fs.readFileSync('src/draft/content/gwangju-legal/'+file)),file);
 assert.deepEqual(copied10,original10);assert.deepEqual(copied11,original11);
 assert.equal(copied10.projectSources.length,7);
 assert.deepEqual(copied10.legalSources.map(x=>x.code),['B03','B06','B07','B08','B08-1','B05-1','B90']);
 assert.match(copied10.projectSources[0].source,/서산시 반다비/);
});
test('All 13 canonical prompts retain their complete text in downloads and the taught workflow',()=>{
 const prompts=[...copied10.lesson10Prompts,...copied11.lesson11Prompts];assert.equal(prompts.length,13);assert.equal(new Set(prompts.map(p=>p.id)).size,13);
 for(const p of prompts)assert.equal(read('public/downloads/daejeon/lesson-10/'+promptGuides[p.id].filename).replaceAll('\r\n','\n').trimEnd(),p.prompt.replaceAll('\r\n','\n').trimEnd(),p.id);
 assert.deepEqual(copied11.lesson11Workflow,['프로젝트 원자료','NotebookLM A','B00 프로젝트 조건 기준서','GPT 법규 Research','공식 법규 Source 확보','NotebookLM B','1차 법규 검토 체크리스트','GPT 독립 교차검증','NotebookLM B 보완·GPT 재검증','사람 최종검수']);
 assert.match(copied10.lesson10Prompts.find(p=>p.id==='lesson10-prompt-a00').prompt,/프로젝트 원자료/);
 assert.match(copied11.lesson11Prompts.find(p=>p.id==='lesson11-prompt-03').prompt,/B00/);
});
test('29 integrated sections follow the requested original sequence and three 50-minute Parts',()=>{
 const {lesson,sectionMap}=map;assert.equal(lesson.sections.length,29);assert.equal(new Set(lesson.sections.map(x=>x.id)).size,29);
 assert.deepEqual(lesson.parts.map(p=>lesson.sections.slice(p.start,p.end).reduce((n,s)=>n+s.minutes,0)),[50,50,50]);
 assert.deepEqual(lesson.sections.slice(0,8).map(x=>x.sourceKey),Array.from({length:8},(_,i)=>'gw10-'+String(i+1).padStart(2,'0')));
 const order=lesson.sections.map(x=>x.sourceKey);assert(order.indexOf('gw11-07')<order.indexOf('gw11-08'));assert(order.indexOf('gw11-08')<order.indexOf('gw11-09'));assert(order.indexOf('gw11-09')<order.indexOf('gw11-11'));assert(order.indexOf('gw11-11')<order.indexOf('gw11-13'));assert(order.indexOf('gw11-13')<order.indexOf('gw11-14'));
 assert(Object.values(sectionMap).every(x=>x.minutes>0));
 const page=read('src/draft/pages/lessons/10.astro');assert.match(page,/DaejeonLesson10GroundedLegal/);assert(!page.includes('DaejeonModelingLesson'));
});
test('Original scoped card styles are retained; temporary reversed-role materials are retired',()=>{
 for(const [n,file]of[['10','Lesson10GroundedLegalReview.astro'],['11','Lesson11LegalCrossValidation.astro']]){
  const a=read('src/components/content/'+file),b=read('src/draft/components/GwangjuLesson'+n+'LegalContent.astro');
  assert.equal(a.slice(a.indexOf('<style>')),b.slice(b.indexOf('<style>')),file);
 }
 const shared=JSON.parse(read('src/draft/content/lesson0910-source.json'));
 for(const id of ['l10-source-audit','l10-project-evidence','l10-site-check','l10-spatial-check','l10-hallucination-check','l10-final-report'])assert(!shared.prompts[id],id);
 for(const file of ['l10-source-audit.txt','l10-project-evidence.txt','LEGAL-REVIEW-TEMPLATE.md','PROJECT-EVIDENCE.csv','DJ-L10-Legal-Review-Pack.zip'])assert(!fs.existsSync('public/downloads/daejeon/lesson-10/'+file),file);
 const manifest=JSON.parse(read('public/downloads/daejeon/lesson-10/manifest.json'));
 for(const file of manifest.files){assert(!/\.(pdf|docx|dwg|blend|hwp|hwpx)$/i.test(file.outputPath)||bandabiAllowed.has(file.outputPath));assert.equal(createHash('sha256').update(fs.readFileSync('public/'+file.outputPath)).digest('hex'),file.sha256);}
});
