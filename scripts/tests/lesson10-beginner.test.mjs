import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const root='';
const data=JSON.parse(read(root+'src/draft/content/lesson10-bandabi-materials.json'));
const guides=JSON.parse(read(root+'src/draft/content/lesson10-prompt-guides.json'));
const map=JSON.parse(read(root+'src/draft/content/lesson10-grounded-map.json'));
test('핵심 네 단계가 첫 안내이며 리드·제목·목차는 코드보다 작업을 먼저 설명한다',()=>{
 const body=read(root+'src/draft/components/DaejeonLesson10GroundedLegal.astro');
 assert(body.indexOf('<Lesson10CoreLogic />')<body.indexOf('<TopicProgress'));
 assert(!/A99|B00|B99|Grounding|Research|Source/.test(map.lesson.lead));
 for(const item of [...map.lesson.parts,...map.lesson.sections])assert(!/A99|B00|B99|Grounding|Research|Source/.test(item.title),item.title);
 assert.equal(map.lesson.sections.length,29);assert.equal(map.lesson.sections.reduce((s,x)=>s+x.minutes,0),150);
});
test('프롬프트 13개마다 실행 자료·목적·통제 이유·짧은 요청 예시가 다르게 준비된다',()=>{
 assert.equal(Object.keys(guides).length,13);assert.equal(new Set(Object.values(guides).map(x=>x.aiPromptTip)).size,13);
 for(const g of Object.values(guides)){
  for(const field of ['platform','howToUse','purpose','derivation','variables','aiPromptTip'])assert(g[field].length>12,field);
  assert(/[가-힣]/.test(g.filename));assert(fs.existsSync(root+'public/downloads/daejeon/lesson-10/'+g.filename));
 }
 const body=read(root+'src/draft/components/GwangjuLegalPrompt.astro');assert(body.includes('<PromptPlatformGuide'));assert(body.includes('{prompt}'));
});
test('자료 48종에 한글 문서명이 있고 요청한 프로젝트 파일명이 정확히 대응한다',()=>{
 for(const i of data.items){assert(/[가-힣]/.test(i.file),i.file);assert(!i.file.startsWith('bandabi-'));}
 const expected=['A01_건축기획서.pdf','A02_지구단위계획보고서.pdf','A03_건축물등에관한결정도.pdf','A04_설계공모_질의답변.pdf','A05_기존국민체육센터_설계개요_층별면적표.pdf','A06-1_기존국민체육센터_부지배치도_01.pdf','A06-2_기존국민체육센터_부지배치도_02.pdf','A07_현황측량도.pdf'];assert.deepEqual(data.items.filter(i=>i.group==='project').map(i=>i.file),expected);
 const rootFiles=fs.readdirSync(root+'public/downloads/daejeon/lesson-10');assert(!rootFiles.some(n=>n.startsWith('bandabi-')||/^lesson1[01]-prompt-/.test(n)));
});
