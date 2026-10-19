import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {spawnSync} from 'node:child_process';
import {getCourseProfile} from '../course-registry.mjs';
import {assertKoreanLesson07Prompt,verifyLesson07Assets} from '../build-daejeon-lesson07-assets.mjs';
const manifest=verifyLesson07Assets();
const prompts=JSON.parse(fs.readFileSync('src/draft/content/lesson07-prompts.json','utf8'));
const source=fs.readFileSync('src/draft/content/daejeon-lesson07.ts','utf8').replace("import prompts from './lesson07-prompts.json';",'const prompts='+JSON.stringify(prompts)+';');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const content=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const lesson08Source=fs.readFileSync('src/draft/content/daejeon-lesson08.ts','utf8');
const lesson08Compiled=ts.transpileModule(lesson08Source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const lesson08=await import('data:text/javascript;base64,'+Buffer.from(lesson08Compiled).toString('base64'));
test('Revision11 concentrates Lesson07 into 16 sections and six complete teaching parts',()=>{
 const ids=['l07-recap','l07-mesh-vs-gs','l07-gs-role','l07-comfyui-env','l07-gs-practice','l07-gs-inspection','l07-render-bridge','l07-five-routes','l07-render-compare','l07-render-prompt','l07-partial-fix','l07-upscale-principle','l07-comfyui-upscale','l07-openvino-sr1033','l07-final-check','l07-handover'];
 assert.deepEqual(content.lesson07Sections.map(s=>s.id),ids);assert.equal(new Set(ids).size,16);
 assert.deepEqual(content.lesson07Sections.map(s=>s.minutes),[15,20,15,25,15,10,15,20,15,25,25,20,30,30,15,5]);
 assert.equal(content.lesson07Sections.reduce((n,s)=>n+s.minutes,0),300);
 assert.deepEqual(content.lesson07Parts.map(p=>p.sections.reduce((n,s)=>n+s.minutes,0)),[50,50,50,50,50,50]);
 assert.deepEqual(content.lesson07Parts.flatMap(p=>p.sections.map(s=>s.id)),ids);
 assert.equal(content.lesson07Meta.date,'2026.05.16 (토)');assert.equal(content.lesson07Meta.durationMinutes,300);
});
test('Lesson08 receives six preserved floorplan sections plus MCP in three 50-minute parts without guessing a date',()=>{
 assert.deepEqual(lesson08.lesson08Sections.map(s=>s.id),['l08-plan-prep-why','l08-notebooklm-plan','l08-clean-line-criteria','l08-spatial-validation','l08-graphviz-diagram','l08-part2-handover','l08-mcp-concept-ecosystem','l08-blender-mcp-setup','l08-blender-mcp-hello-world']);
 assert.deepEqual(lesson08.lesson08Sections.map(s=>s.minutes),[15,15,20,20,20,10,15,20,15]);
 assert.deepEqual(lesson08.lesson08Parts.map(p=>p.sections.reduce((n,s)=>n+s.minutes,0)),[50,50,50]);
 assert.equal(lesson08.lesson08Meta.durationMinutes,150);assert.equal(lesson08.lesson08Meta.weekday,'월요일');assert.equal(lesson08.lesson08Meta.date,null);
 assert.equal(lesson08.lesson08Meta.status,'design-pending');assert.equal(lesson08.lesson08Meta.reviewStatus,'instructor-review');
});
test('Draft authorization adds Lesson08 without publishing or approving the course',()=>{
 const {course,release}=getCourseProfile('daejeon-2026');assert.equal(course.contentStatus,'design-pending');assert.deepEqual(course.lessons,[]);assert.deepEqual(release.releasedStudentLessonIds,[]);
 assert.deepEqual(course.reviewDraft.lessons.filter(l=>['07','08'].includes(l.id)),[{id:'07',durationMinutes:300},{id:'08',durationMinutes:150}]);
});
test('Prompt policy permits technical names but rejects English sentence runs',()=>{
 assert.throws(()=>assertKoreanLesson07Prompt('Please keep the original camera unchanged at all times'));
 assert.doesNotThrow(()=>assertKoreanLesson07Prompt('OpenVINO SR1033 결과를 원본과 비교합니다.'));
 for(const p of prompts){assert.deepEqual([...p.learning.matchAll(/^\[(.+)\]$/gm)].map(m=>m[1]),['목적','맥락','입력자료','작업 단계','조건·제한','출력 형식','검토 기준']);assertKoreanLesson07Prompt(p.learning);assertKoreanLesson07Prompt(p.execution);}
});
test('SHA-256 provenance and actual CPU outputs agree; GPU results are not claimed',()=>{
 assert.equal(manifest.runtime.testedDevice,'CPU');const input=manifest.runtime.inputs[0];for(const o of manifest.runtime.outputs){assert.equal(o.width,input.width*3);assert.equal(o.height,input.height*3);}
 assert.equal(manifest.files.filter(f=>/^route-/.test(f.key||'')).length,5);
 assert.equal(manifest.gaps.find(g=>g.id==='gaussian-ply').status,'not-provided-by-approved-scope');assert.equal(manifest.gaps.find(g=>g.id==='gaussian-six-views').status,'not-provided-by-approved-scope');assert(!manifest.files.some(f=>/\.(?:ply|pth|safetensors|xml|bin|pdf)$/.test(f.outputPath)||/gaussian-view-0[1-6]|partial-fix-after/.test(f.outputPath)));
 assert.equal(manifest.files.filter(f=>/workflow_triposplat_(?:modified|optimized)\.json$/.test(f.outputPath)).length,2);
 assert.equal(manifest.files.filter(f=>/upscale_(?:basic|modified)\.json$/.test(f.outputPath)).length,2);
});
test('Distributed ZIPs are valid, self-contained and disclose missing Gaussian results',()=>{
 const script=`import json,sys,zipfile\nfrom pathlib import Path\nr=Path(sys.argv[1])\nfor p in r.glob('*.zip'):\n with zipfile.ZipFile(p) as z:\n  assert z.testzip() is None\n  names=z.namelist();assert len(names)==len(set(names))\n  assert all(not n.startswith('/') and '..' not in n.split('/') for n in names)\n  assert not any(n.lower().endswith(('.pth','.safetensors','.xml','.bin','.pdf','.ply')) or 'partial-fix-after' in n for n in names)\n  assert 'ASSET-READINESS.md' in names\n  assert not any('Floorplan-Graphviz-Pack' in n for n in names), 'Floorplan-only package belongs to Lesson08'\n  if 'OpenVINO' in p.name:\n   for f in ['run_sr1033.bat','run_sr1033.py','download-sr1033-model.ps1','requirements-verified.txt','input/render-source.png','output/render-source_Bicubic_3x.png','output/render-source_SR1033_3x.png','provenance/execution.json']:assert f in names,f\n  if 'Gaussian-Views' in p.name:\n   assert 'workflow_triposplat_modified.json' in names and 'workflow_triposplat_optimized.json' in names\nprint('All four ZIPs passed CRC / path / contents checks')`;
 const r=spawnSync('python',['-c',script,'public/downloads/daejeon/lesson-07'],{encoding:'utf8',windowsHide:true});assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/four ZIPs passed/);
});

test('Living source chain and official Lykos instructions are explicit in the teaching component',()=>{
 const body=fs.readFileSync('src/draft/components/DaejeonLesson07Draft.astro','utf8');
 const chain=body.slice(body.indexOf('data-l07-gaussian-source-chain'));
 assert(chain.indexOf('gaussian-plan-source')<chain.indexOf('gaussian-isometric-source'));
 assert(chain.indexOf('gaussian-isometric-source')<chain.indexOf('assetKey="gaussian"'));
 for(const key of ['gaussian-plan-source','gaussian-isometric-source'])assert(manifest.files.some(file=>file.key===key),key);
 assert(body.includes('href="https://lykos.ai/"'));assert(body.includes('StabilityMatrix-win-x64.zip'));
 assert(!body.includes('이 캡처의 원래 입력은 확보되지 않았습니다'));
 assert(!body.includes('거실 Gaussian 캡처와 동일 공간의 생성 전후라고 주장하지 않습니다'));
 for(const text of ['Cross-Generation','형태 정확성과 렌더링 품질의 상충 관계','4x-UltraSharp 4배','고화질 렌더링'])assert(body.includes(text),text);
});
