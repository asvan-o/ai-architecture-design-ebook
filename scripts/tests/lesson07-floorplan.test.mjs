import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {spawnSync} from 'node:child_process';
import {floorplanAudit,floorplanPromptDefinitions,displayFloorplanPrompt,verifyLesson07FloorplanAssets} from '../daejeon-lesson07-floorplan-assets.mjs';
import {verifyLesson08Assets} from '../daejeon-lesson08-assets.mjs';
import {createHash} from 'node:crypto';
const source=JSON.parse(fs.readFileSync('src/draft/content/lesson07-floorplan-source.json','utf8'));
const original=fs.readFileSync('src/components/content/Lesson09SpatialZoning.astro','utf8');
test('Full source prompts retain protected wording except explicit synthetic-source adaptations',()=>{
 for(const key of [...floorplanPromptDefinitions.map(p=>p[0]),'actualDotCode']){
  const marker='const '+key+' = `',start=original.indexOf(marker),end=original.indexOf('`;',start+marker.length);
  const retained=Function('return '+original.slice(start+('const '+key+' = ').length,end+1))().replaceAll('사람이 정리한 선화 이미지','원본과 대조한 교육용 클린 선화 이미지').replaceAll('좌측 개방영역','통로 측 개방영역').replaceAll('좌측 문 바깥 영역','통로 측 개방영역');assert.equal(source[key],retained,key);
 }
 for(const [key,file] of floorplanPromptDefinitions){const bytes=fs.readFileSync('public/downloads/daejeon/lesson-08/'+file+'.txt','utf8');assert.equal(bytes,displayFloorplanPrompt(source[key])+'\n');assert(!/Gwangju|광주|14차시|42시간|승인본|검수본|초안/.test(bytes));}
 assert.equal(source.reviewRows.length,12);assert.equal(source.functionGroups.length,6);
});
test('Direct relations and review boundaries remain explicit in the full DOT source',()=>{
 const dot=source.actualDotCode;
 assert.equal([...dot.matchAll(/label="(?:직접문|개방 연속) \/ KEEP"/g)].length,9);
 for(const edge of ['Office -> Deck1','Director -> Deck2','Meeting -> Deck3','Elevator -> Stairs'])assert(dot.includes(edge));
 assert.match(dot,/Office -> Pantry \[label="직접문 없음"\]/);assert.match(dot,/Pantry -> Storage \[label="경계·연속 방식 REVIEW"\]/);
 assert.match(dot,/Meeting -> Model \[label="벽 공유 · 직접문 없음"\]/);
 const plan=JSON.parse(fs.readFileSync(floorplanAudit+'/source/office-geometry.json','utf8'));assert.deepEqual(plan.outerDimensionMm,[24000,16000]);assert(!plan.directDoors.some(d=>[d.a,d.b].includes('회의실')&&[d.a,d.b].includes('모형실')));assert.equal(plan.directDoors.length,8);
});
test('Synthetic images and own original PDF are packaged; external PDFs and internal DOCX are excluded',()=>{
 const manifest=verifyLesson08Assets();assert.equal(manifest.files.filter(f=>f.kind==='image').length,5);assert.equal(manifest.files.length,17);assert.equal(manifest.includedOriginalPdf,true);
 const pdf=manifest.files.find(f=>f.kind==='original-pdf');assert(pdf);assert.equal(fs.readFileSync('public/'+pdf.outputPath).subarray(0,5).toString(),'%PDF-');
 const r=spawnSync('python',['-c','import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);assert z.testzip() is None;ns=z.namelist();assert len(ns)==16;assert [n for n in ns if n.lower().endswith(".pdf")]==["DJ-L07-Office-Floorplan-Original.pdf"];assert not any(n.lower().endswith(".docx") for n in ns);assert sum(n.startswith("images/") for n in ns)==5;assert "Graphviz-DOT-source.txt" in ns;assert "DJ-L07-clean-line-preprocess.txt" in ns;print("Synthetic ZIP CRC / PDF / Prompt PASS")','public/downloads/daejeon/lesson-08/DJ-L08-Floorplan-Graphviz-Pack.zip'],{encoding:'utf8',windowsHide:true});assert.equal(r.status,0,r.stderr);
 assert(fs.existsSync(floorplanAudit+'/floorplan-manifest.json'));
});
test('Former participant hashes remain absent across Lesson07 and Lesson08 including nested ZIPs',()=>{
 const script=`import hashlib,io,json,sys,zipfile
from pathlib import Path
blocked={f['sha256'] for f in json.loads(Path('review/daejeon/DJ-ALL-LESSONS-FLOORPLAN-STAIR-AND-DOOR-AUDIT-FIX/revision-9/former-external-assets.json').read_text(encoding='utf8'))}
def scan(name,data,depth=0):
 assert hashlib.sha256(data).hexdigest() not in blocked,name
 if name.lower().endswith('.zip'):
  assert depth<6
  with zipfile.ZipFile(io.BytesIO(data)) as z:
   assert z.testzip() is None
   ns=z.namelist();assert len(ns)==len(set(ns));assert all(not n.startswith('/') and '..' not in n.split('/') for n in ns)
   for n in ns:
    if not n.endswith('/'):scan(name+'!/'+n,z.read(n),depth+1)
for lesson in ['07','08']:
 for kind in ['images','downloads']:
  for p in Path('public/'+kind+'/daejeon/lesson-'+lesson).rglob('*'):
   if p.is_file():scan(p.as_posix(),p.read_bytes())
pdf=Path('public/downloads/daejeon/lesson-08/DJ-L07-Office-Floorplan-Original.pdf').read_bytes()
with zipfile.ZipFile('public/downloads/daejeon/lesson-08/DJ-L08-Floorplan-Graphviz-Pack.zip') as z:assert z.read('DJ-L07-Office-Floorplan-Original.pdf')==pdf
with zipfile.ZipFile('public/downloads/daejeon/lesson-07/DJ-L07-Starter-Pack.zip') as z:assert not any('Floorplan-Graphviz-Pack' in n for n in z.namelist())
print('Lesson07/08 former-source exclusion and PDF migration PASS')`;
 const r=spawnSync(process.env.PYTHON||'python',['-c',script],{encoding:'utf8',windowsHide:true});assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/PDF migration PASS/);
});

test('Eight moved copy blocks keep their IDs and source expressions while original assets remain byte-identical',()=>{
 const expected=['l07-plan-analysis','l07-plan-criteria','l07-clean-line-prompt','l07-plan-topview','l07-spatial-analysis','l07-spatial-validation-prompt','l07-graphviz-prompt','l07-actual-dot'];
 const component=fs.readFileSync('src/draft/components/Lesson07FloorplanPart.astro','utf8');
 assert.deepEqual([...component.matchAll(/<ReviewPrompt\b[^>]*\bid="([^"]+)"/g)].map(m=>m[1]),expected);
 const manifest=verifyLesson08Assets(),protectedManifest=JSON.parse(fs.readFileSync('review/daejeon/DJ-L06-L07-ORIGINAL-HOUSE-PLAN-AND-DOOR-STAIR-PRECISION-FIX/revision-10/floorplan-manifest.json','utf8'));
 const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
 const snapshot=JSON.parse(fs.readFileSync('review/daejeon/DJ-L06-L07-L08-RESTRUCTURE-AND-CAD-3D-ALIGNMENT/revision-11/before.json','utf8'));
 for(const file of ['src/draft/content/lesson07-floorplan-source.json','src/draft/content/lesson07-floorplan.ts','src/draft/content/lesson07-prompts.json','src/draft/content/prompt-platform-guides.ts','src/draft/content/prompt-derivations.ts'])assert.equal(hash(file==='src/draft/content/lesson07-floorplan.ts'?Buffer.from(fs.readFileSync(file,'utf8').replace('원본 도면 이미지 00-office-floorplan-original.png(또는 comfy-reference-before.png)','원본 도면 이미지(comfy-reference-before.png 또는 같은 원본 평면도 이미지)').replaceAll('Viz.js / WebGraphviz','WebGraphviz / Viz.js')):fs.readFileSync(file)),snapshot.files.find(f=>f.file===file).sha256,'Protected Prompt / four-field guide source changed: '+file);
 const expressions=['floorplanPrompts.notebookPlanAnalysisPrompt','floorplanPrompts.floorPlanCriteriaPrompt','cleanLinePrompt','floorplanPrompts.topViewPrompt','floorplanPrompts.spatialAnalysisPrompt','floorplanPrompts.validationPrompt','floorplanPrompts.graphvizPrompt','actualDotCode'];
 assert.deepEqual([...component.matchAll(/<ReviewPrompt[^>]* prompt=\{([^}]+)\}/g)].map(m=>m[1]),expressions);
 for(const file of manifest.files.filter(f=>f.kind==='image'||f.kind==='original-pdf')){
  if(file.key==='office-original-png'){assert.equal(hash(fs.readFileSync('public/'+file.outputPath)),hash(fs.readFileSync('public/images/daejeon/lesson-07/comfy-reference-before.png')));continue;}
  const protectedFile=protectedManifest.files.find(f=>f.key===file.key&&f.kind===file.kind);assert(protectedFile,file.key);
  assert.equal(hash(fs.readFileSync('public/'+file.outputPath)),protectedFile.sha256,file.outputPath);
 }
 assert(fs.readFileSync('src/draft/components/DaejeonLesson08Draft.astro','utf8').includes('Lesson07FloorplanPart sectionId={section.id}'));
 assert(!fs.readFileSync('src/draft/components/DaejeonLesson07Draft.astro','utf8').includes('<Lesson07FloorplanPart'));
});

test('Door leaves, full swing sectors and elevator sliding symbol have valid geometry and furniture clearance',()=>{
 const result=spawnSync(process.execPath,[floorplanAudit+'/verify-door-geometry.mjs'],{encoding:'utf8',windowsHide:true});
 assert.equal(result.status,0,result.stdout+result.stderr);
});
