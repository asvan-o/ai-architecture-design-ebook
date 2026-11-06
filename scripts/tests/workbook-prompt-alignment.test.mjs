import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const alignment=JSON.parse(read('src/draft/content/prompt-alignment-overrides.json'));
test('Learning examples, composition and exact raster operations use distinct execution roles',()=>{
 for(const id of ['gw-annotated-copy','conflicting']){assert.equal(alignment[id].role,'example');assert.match(alignment[id].execution,/하지 않습니다/);}
 assert.equal(alignment['assemble-template'].role,'text');
 for(const id of ['l05-prompt-recompose','l05-prompt-overlay']){assert.equal(alignment[id].kind,'code');assert.match(alignment[id].platform,/Python/);}
 for(const v of Object.values(alignment))if(v.role)assert(['example','text','image','local','human'].includes(v.role));
});
test('Exterior short requests are actually shorter and keep the original seven-step input references',()=>{
 const roots=['review/daejeon/DJ-L04-EXTERIOR-PLAN/implementation-13/prompts','review/daejeon/DJ-L04-EXTERIOR-PLAN/application-05-techniques/prompts'];let pairs=0;
 for(const root of roots)for(const file of fs.readdirSync(root).filter(f=>f.endsWith('-7step.txt'))){const short=file.replace('-7step.txt','-short.txt');const a=read(root+'/'+file),b=read(root+'/'+short);assert.notEqual(a,b,file);assert(b.length<a.length,short);assert.match(b,/유지|고정|원본|기준|이어 줘/);pairs++;}
 assert.equal(pairs,21);
});
test('Floorplan image execution is separate from historical text and post-generation verification',()=>{
 const adapted=read('src/draft/content/lesson08-workbook-prompts.ts');
 const clean=JSON.parse(adapted.match(/export const cleanLinePrompt=("(?:\\.|[^"\\])*")/)[1]);
 assert.equal(read('public/downloads/daejeon/lesson-08/DJ-L07-clean-line-preprocess.txt').trimEnd(),clean.trimEnd());
 assert.match(clean,/이미지 1장만/);assert.match(clean,/별도 사람 검수/);
 const component=read('src/draft/components/Lesson07FloorplanPart.astro');assert.match(component,/lesson08-workbook-prompts/);
});
test('Portfolio prompts include all floors and the report hash activity links to an actual manifest',()=>{
 const data=JSON.parse(read('src/draft/content/lesson111213.json'));
 const iso=data.prompts.find(p=>p.id==='l12-portfolio-prompt-03');assert.match(iso.guide.aiPromptTip,/1.?3층|1·2·3층|1층.*2층.*3층/);
 const last=data.lessons['13'];assert.equal(last.durationMinutes,300);assert.equal(last.sections.reduce((n,s)=>n+s.minutes,0),300);
 assert.match(read('src/draft/components/DaejeonPortfolioLesson.astro'),/통합 ZIP 기준 해시/);
 const block=last.sections.flatMap(s=>s.blocks).find(b=>b.body?.includes('Get-FileHash'));assert.match(block.body,/통합패키지_파일해시_SHA256\.txt/);assert(!/SHA256SUMS\.txt/.test(block.body));
});
