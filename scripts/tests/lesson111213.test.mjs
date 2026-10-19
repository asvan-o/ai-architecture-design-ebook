import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash}from'node:crypto';
const data=JSON.parse(fs.readFileSync('src/draft/content/lesson111213.json','utf8'));
const assets=JSON.parse(fs.readFileSync('src/draft/content/lesson111213-assets.json','utf8'));
test('제11~13차시는 3개 Part·각 50분·각 12개 section·150분을 유지한다',()=>{
 for(const id of ['11','12','13']){let l=data.lessons[id];assert.equal(l.sections.length,12);assert.equal(new Set(l.sections.map(s=>s.id)).size,12);assert.equal(l.durationMinutes,150);for(let n=0;n<3;n++)assert.equal(l.sections.slice(n*4,n*4+4).reduce((a,s)=>a+s.minutes,0),50);assert.equal(l.topic,7);}
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
 const content=JSON.stringify(data);assert(content.includes('반다비'));assert(content.includes('법정'));assert(content.includes('주택 워킹투어'));assert(content.includes('미확정'));
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
