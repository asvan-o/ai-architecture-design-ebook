import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root='review/daejeon/DJ-CF-02/';
const read=p=>fs.readFileSync(p);
const text=p=>read(root+p).toString('utf8');
const json=p=>JSON.parse(read(p).toString('utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const fixture=json('scripts/tests/fixtures/approved-cf02-renewal-l02-vibe.json');
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;

test('CF02 원래 건물의 치수·입면·현황 사진과 RFP 분석 영역은 그대로 보존한다',()=>{
 for(const [file,expected] of Object.entries(fixture.fixedCf02Files))assert.equal(sha(read(file)),expected,file);
 const g=json(root+'source/DJ-CF-02_building-camera.json');assert.deepEqual([g.building.width,g.building.depth,g.building.height],[13.6,8.2,9.6]);
 const sign=g.elements.find(x=>x.id==='SZ1');assert.deepEqual([sign.w,sign.h],[11.4,.65]);
});

test('두 전략 모두 1·2층 전체 마감을 정돈하고 세로 입구 집중과 수평 리듬을 구분한다',()=>{
 const c=json(root+'source/DJ-CF-02_content.json'),a=JSON.stringify(c.strategies.A),b=JSON.stringify(c.strategies.B);
 for(const word of ['1·2층','라임스톤','다크 브론즈','D1','캐노피','월워셔'])assert(a.includes(word),word);
 for(const word of ['1·2층','트래버틴','톤온톤','루버','라인 조명','SZ1','D1'])assert(b.includes(word),word);
 assert.match(b,/적벽돌.*(?:않|금지)|적벽돌.*남기지/);
 assert.match(JSON.stringify(c.brief[8]),/라임스톤/);assert.match(JSON.stringify(c.brief[8]),/트래버틴/);
 for(const letter of ['A','B']){
  assert.deepEqual(read(root+`DJ-CF-02_image-prompt-${letter}.txt`),read(root+`DJ-CF-02_example-${letter}-execution-prompt.txt`));
  for(const suffix of [`example-${letter}-prompt.txt`,`example-${letter}-execution-prompt.txt`]){const p=text('DJ-CF-02_'+suffix);assert.match(p,/1·2층|1층.*2층/);assert.match(p,/D1/);assert.match(p,/W1.?W5|W1|창호/);assert.match(p,/SZ1/);assert.match(p,/같은|동일/);}
 }
 assert.match(text('DJ-CF-02_comparison-note.md'),/라임스톤/);assert.match(text('DJ-CF-02_comparison-note.md'),/트래버틴/);
});

test('CF02 안내 문구 병합은 실행 역할·종류·플랫폼·편집 대상을 지우거나 덮어쓰지 않는다',()=>{
 const guides=json('src/draft/content/prompt-alignment-overrides.json');
 assert.deepEqual(Object.keys(fixture.cf02GuideBaseline),['DJ-CF-02-example-A-execution','DJ-CF-02-example-B-execution','DJ-CF-02-learning','DJ-CF-02-execution']);
 for(const [id,original] of Object.entries(fixture.cf02GuideBaseline)){
  const current=guides[id],allowed=fixture.cf02GuideAllowedUpdates[id];assert(current,id);
  assert.deepEqual(Object.keys(current).sort(),Object.keys(original).sort(),id+' guide fields lost or added');
  for(const field of ['role','kind','platform','execution','editTarget']){assert(original[field],id+' baseline '+field);assert.equal(current[field],original[field],id+' '+field);}
  for(const field of Object.keys(original))if(!allowed.includes(field))assert.deepEqual(current[field],original[field],id+' protected '+field);
  for(const field of allowed)assert(typeof current[field]==='string'&&current[field].trim(),id+' updated '+field);
 }
 assert.equal(guides['DJ-CF-02-learning'].role,'text');
 for(const id of ['DJ-CF-02-example-A-execution','DJ-CF-02-example-B-execution','DJ-CF-02-execution'])assert.equal(guides[id].role,'image');
});

test('새 A/B 출력은 실제 생성 기록·Prompt SHA와 연결하고 이전 현황 기록은 바꾸지 않는다',()=>{
 const records=json(root+'instructor/DJ-CF-02_generation-log.json');
 for(const [asset,expected] of Object.entries(fixture.existingViewGenerationRecords)){
  const record=records.find(x=>x.asset===asset);assert(record,asset);assert.equal(sha(Buffer.from(JSON.stringify(stable(record)))),expected,asset+' historical record');
 }
 const history=json(root+'instructor/DJ-CF-02_generation-history-before-renewal.json').records;
 for(const [asset,expected] of Object.entries(fixture.previousExampleSha256)){
  const original=history.find(x=>x.asset===asset);assert.equal(original?.outputSha256,expected,asset+' history');
  const current=records.find(x=>x.asset===asset);assert(current?.regenerated,asset);
  const output=sha(read(root+asset));assert.equal(current.outputSha256,output,asset);assert.notEqual(output,expected,asset+' not replaced');
  const promptFile=current.promptFile.replaceAll('\\','/');assert.equal(sha(read(root+promptFile)),current.promptSha256,asset+' prompt hash');
  assert.equal(text(promptFile).trim(),current.exactToolArguments.prompt.trim(),asset+' actual prompt');
  assert.match(current.backendModel,/not exposed|미공개|노출되지/);assert(!/GPT-5|GPT-6\.1|Nano Banana로 생성/.test(current.backendModel));
  for(const [name,hash] of Object.entries(current.inputSha256||{})){const file=path.join(root,name);if(fs.existsSync(file))assert.equal(sha(read(file)),hash,asset+' input '+name);}
  if(current.refinements?.length){assert.equal(current.refinements.at(-1).outputSha256,output);assert(current.refinements.every(x=>x.reason&&x.exactToolArguments?.prompt&&x.inputSha256));assert(current.attempt>=2);}
 }
});
