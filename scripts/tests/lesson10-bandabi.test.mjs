import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {getLesson0910Assets} from '../daejeon-lesson0910-assets.mjs';
const read=p=>fs.readFileSync(p,'utf8');
const data=JSON.parse(read('src/draft/content/lesson10-bandabi-materials.json'));
const folder='public/downloads/daejeon/lesson-10/';
test('Bandabi source groups keep raw project inputs, legal evidence and AI exemplars separate',()=>{
 const group=g=>data.items.filter(x=>x.group===g);
 assert.equal(group('project').length,8);assert.equal(group('current-law').length,11);assert.equal(group('annex').length,10);assert.equal(group('example').length,3);
 assert(data.items.every(x=>x.group==='example'||/^https:\/\/(?:www\.)?(?:seosan|law)\.go\.kr\//.test(x.sourceUrl)||x.id==='B90'));
 for(const x of data.items)assert.equal(createHash('sha256').update(fs.readFileSync(folder+x.file)).digest('hex'),x.sha256,x.id);
 assert.equal(data.items.find(x=>x.id==='A99').sha256,data.items.find(x=>x.id==='B00').sha256);
});
test('Actual source limitations and correct municipal parking annex remain explicit',()=>{
 assert.match(data.items.find(x=>x.id==='B06').note,/2쪽.*발췌/);
 assert.match(data.items.find(x=>x.id==='B08').note,/개정이유·개정문/);
 assert.match(data.items.find(x=>x.id==='B07').note,/2025.12.10/);
 assert(data.items.some(x=>x.id==='N06-ANNEX-6'));assert(!data.items.some(x=>x.id==='N06-ANNEX-2'));
 assert.match(data.items.find(x=>x.id==='S04').role,/DWG 4종/);
 for(const x of data.items.filter(x=>x.group==='current-law')){
  const text=read(folder+x.file);assert(text.length>5000);assert.match(text,/제1조/);assert.match(text,/시행/);assert.match(text,/별표.*포함하지/);
 }
});
test('Review media allowlist admits Bandabi documents while excluding unrelated source drawings',()=>{
 const assets=getLesson0910Assets();assert(assets.some(x=>x.outputPath.endsWith('A01_건축기획서.pdf')));
 assert(!assets.some(x=>/HWANG_INSU|치수포함|\.dwg$|\.blend$/.test(x.outputPath)));
 const m=JSON.parse(read(folder+'manifest.json'));assert.equal(m.originalDrawingsScope,'seosan-bandabi-public-competition-only');assert.equal(m.hwangInsuOriginalDrawingsIncluded,false);
 assert.equal(data.reviewMatrix.length,7);assert(data.reviewMatrix.every(x=>x.missing&&x.status));
});
