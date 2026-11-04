import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash}from'node:crypto';
const data=JSON.parse(fs.readFileSync('src/draft/content/lesson111213.json','utf8'));
const assets=JSON.parse(fs.readFileSync('src/draft/content/lesson111213-assets.json','utf8'));
test('평일 11·12차시는 150분, 주말 13차시는 300분이며 실제 활동 합계가 일치한다',()=>{
 for(const id of ['11','12','13']){const l=data.lessons[id],weekend=id==='13';assert.equal(l.sections.length,weekend?18:12);assert.equal(new Set(l.sections.map(s=>s.id)).size,l.sections.length);assert.equal(l.durationMinutes,weekend?300:150);assert.equal(l.parts.length,weekend?6:3);assert.equal(l.sections.reduce((n,s)=>n+s.minutes,0),l.durationMinutes);for(let part=1;part<=l.parts.length;part++)assert.equal(l.sections.filter(s=>s.part===part).reduce((n,s)=>n+s.minutes,0),50);assert.equal(l.topic,7);}
 const profile=JSON.parse(fs.readFileSync('data/courses/daejeon-2026/course.json','utf8'));assert.equal(profile.reviewDraft.lessons.reduce((n,l)=>n+l.durationMinutes,0),2400);assert.equal(data.lessons['13'].optionalMinutes,0);assert(data.lessons['13'].sections.some(s=>s.title.includes('수료')));assert(data.lessons['13'].sections.some(s=>s.title.includes('크리틱')));
});
test('핵심 프롬프트 6종에는 7단 구조와 도출 가이드·한글 TXT가 있다',()=>{
 assert.equal(data.prompts.length,6);const labels=['목적','맥락','입력자료','작업 단계','조건·제한','출력 형식','검토 기준'];
 for(const p of data.prompts){for(const label of labels)assert(p.prompt.includes(label+'\n'));for(const k of ['platform','howToUse','purpose','derivation','variables','aiPromptTip'])assert(p.guide[k].length>10);const asset=assets.find(a=>a.filename===p.filename);assert(asset);assert.equal(fs.readFileSync('public/'+asset.outputPath,'utf8').replaceAll('\r\n','\n').trimEnd(),p.prompt);}
});
test('포트폴리오 자산은 등록된 명칭·크기·SHA와 일치한다',()=>{
 assert.equal(assets.filter(a=>['cover','intro','overview','verification'].includes(a.group)).length,4);assert.equal(assets.filter(a=>a.group==='slides').length,8);
 assert.equal(assets.filter(a=>a.group==='legacyCover').length,10);
 for(const a of assets){const b=fs.readFileSync('public/'+a.outputPath);assert.equal(b.length,a.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),a.sha256);assert(/[가-힣]/.test(a.filename));assert(!a.outputPath.includes('..'));}
});
test('주택 법규와 타 건물 영상의 사실 혼합을 방지한다',()=>{
 const content=JSON.stringify(data);assert(content.includes('반다비'));assert(content.includes('법정'));assert(content.includes('미확정'));
 assert(data.lessons['12'].sections.some(section=>section.blocks.some(block=>block.type==='walkthrough')),'제12차시의 실제 주택 워크스루 블록을 유지한다');
 const component=fs.readFileSync('src/draft/components/DaejeonPortfolioLesson.astro','utf8');
 const walkthrough=component.match(/\{b\.type\s*===\s*'walkthrough'[\s\S]*?<\/aside>\}/)?.[0];assert(walkthrough,'워크스루 블록의 실제 렌더링을 유지한다');
 for(const file of ['House_B_Walkthrough.html','House_B_Walkthrough_README.txt']){assert(walkthrough.includes('downloads/daejeon/lesson-09/'+file));assert(fs.existsSync('public/downloads/daejeon/lesson-09/'+file));}
 assert(walkthrough.includes('같은 주택 B안'));assert(walkthrough.includes('고화질 렌더 MP4·Blender 애니메이션 저장본은 아닙니다.'));
 assert(!assets.some(a=>/\.(blend|dwg|mp4)$/.test(a.outputPath)));assert(assets.some(a=>a.filename.endsWith('.pptx')));assert(assets.some(a=>a.filename.endsWith('.pdf')));
});


test('설계 설득 6단계와 재료·입체·로고의 실제 자료가 연결된다',()=>{
 assert.equal(data.storyline.length,6);
 assert.equal(assets.filter(a=>a.group==='materials').length,4);
 assert.equal(assets.filter(a=>a.group==='isometrics').length,3);
 assert.equal(assets.filter(a=>a.group==='logo').length,1);
 assert.equal(assets.filter(a=>a.group==='moodboard').length,1);
 assert.equal(assets.filter(a=>a.group==='aiLayout').length,1);
 const forbidden=String.fromCodePoint(0xBC15,0xB098,0xD638);
 assert(!JSON.stringify(data).includes(forbidden));assert(!JSON.stringify(assets).includes(forbidden));
 for(const a of assets.filter(a=>a.filename.endsWith('.txt')||a.filename.endsWith('.md')||a.filename.endsWith('.json')))assert(!fs.readFileSync('public/'+a.outputPath,'utf8').includes(forbidden));
 const c=fs.readFileSync('src/draft/components/DaejeonPortfolioLesson.astro','utf8');assert(!c.includes(forbidden));
 assert(data.lessons['12'].sections.some(s=>s.title.includes('로고 만드는 법')));
 assert(data.prompts[0].prompt.includes('6단계'));assert(data.prompts[1].prompt.includes('5색'));assert(data.prompts[1].prompt.includes('실제 질감'));
});
