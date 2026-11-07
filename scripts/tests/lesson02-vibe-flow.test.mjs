import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {lesson02Contract,lesson02PromptIds,verifyLesson02Source,verifyProgramPayload,zipMemberHashes} from '../verify-daejeon-automation-ab.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(p);

test('제2차시는 3×50분 단일 프로그램과 Step 1~4·통합 요청문 하나로 이어진다',async()=>{
 const result=await verifyLesson02Source();assert(result.passed);assert.equal(result.sections.length,13);
 assert.deepEqual(result.periodMinutes,[50,50,50]);assert.deepEqual(result.prompts.map(p=>p.id),lesson02PromptIds);
 const {data}=await lesson02Contract();assert.deepEqual(data.sections.slice(7,11).map(s=>s.id),['l02-first-request','l02-plan-review','l02-implementation-spec','l02-implement']);
});

test('새 단계 요청문은 공동 모델 가이드와 원본 TXT를 사용하고 기존 실행 코어·실습 파일은 보존한다',async()=>{
 const {cards}=await lesson02Contract();for(const card of cards){assert.equal(card.guide.kind,'code');assert.equal(card.guide.role,'local');assert(card.guide.aiPromptTip);assert(card.guide.purpose);assert(card.guide.variables);}
 const runtime=verifyProgramPayload();assert.deepEqual(runtime.map(r=>r.unchangedPayloads),[18,12]);
});

function verifyBundle(file){
 const members=zipMemberHashes(read(file),true),root=Object.keys(members)[0].split('/')[0]+'/';
 const manifest=JSON.parse(members[root+'manifest.json'].content.toString('utf8'));
 assert.equal(manifest.selfHashExcluded,true);assert(!manifest.files.some(x=>x.file==='manifest.json'));
 for(const row of manifest.files){const member=members[root+row.file];assert(member,row.file);assert.equal(member.bytes,row.bytes,row.file);assert.equal(member.sha256,row.sha256,row.file);}
 const checks=members[root+'SHA256SUMS.txt'].content.toString('utf8').trim().split('\n').map(line=>line.match(/^([a-f0-9]{64})  (.+)$/));
 assert(checks.every(Boolean));assert.equal(checks.length,Object.keys(members).length-1);
 for(const [,expected,name] of checks)assert.equal(members[root+name]?.sha256,expected,name);
 return {members,root};
}

test('제1·2차시 새 실습 ZIP의 manifest와 전체 멤버 SHA가 실제 원문에 맞는다',async()=>{
 const first=verifyBundle('review/daejeon/DJ-L01-RFP-BRIEF/DJ-L01-rfp-and-brief.zip');
 for(const [name,entry] of Object.entries(first.members)){
  const relative=name.slice(first.root.length);if(!relative.startsWith('DJ-CF-'))continue;
  const [project,file]=relative.split('/');const folder=project==='DJ-CF-02'&&file.endsWith('-generation-prompt.txt')?'instructor/':'';
  assert.equal(entry.sha256,sha(read(`review/daejeon/${project}/${folder}${file}`)),relative);
 }
 const second=verifyBundle('review/daejeon/LESSON02_AUTOMATION_AB/student/A/DJ-L02_VIBE_CODING_PRACTICE.zip');
 const {cards}=await lesson02Contract();for(const card of cards)assert.equal(second.members[second.root+card.file].sha256,sha(Buffer.from(card.prompt)),card.id);
 for(const file of ['DJ-L02_FILE_SORTER_PROGRAM.zip','DJ-L02_SORT_TEST.zip','DJ-L02_FILE_SORTER_README.txt'])assert.equal(second.members[second.root+'실행예제/'+file].sha256,sha(read('review/daejeon/FILE_SORTER_STUDENT/'+file)),file);
});

test('활성 배포 등록에는 도면 점검 B 경로가 없고 단계별 TXT·통합 ZIP을 제공한다',async()=>{
 const assets=await import('../daejeon-automation-ab-assets.mjs');assert.deepEqual(Object.keys(assets.automationFiles),['A']);
 assert(!assets.automationAssets.some(x=>/\/B\/|DJ-L02-B|DRAWING_QUICK_CHECK/.test(x.outputPath)));
 const {cards}=await lesson02Contract();for(const card of cards)assert(assets.automationAssets.some(x=>x.file===card.file),card.file);
 assert(assets.automationAssets.some(x=>x.file==='DJ-L02_VIBE_CODING_PRACTICE.zip'));
 const output=fs.readFileSync('scripts/draft-output.mjs','utf8');assert(!/drawingDemoRoute|DRAWING_QUICK_CHECK|practice\/DJ-L02-B/.test(output));
});
