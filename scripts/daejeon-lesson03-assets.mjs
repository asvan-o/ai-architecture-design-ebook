import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {repositoryRoot} from './course-registry.mjs';
import {ebookText} from './daejeon-ebook-language.mjs';
import {lesson02Images,lesson02BeforeImages,lesson02MaterialImages,lesson02DefaultMaterialIds} from './daejeon-lesson02-assets.mjs';
const preserved=JSON.parse(readFileSync(path.join(repositoryRoot,'review/daejeon/LESSON03_MATERIAL_LIGHTING_PRESERVED/preservation-manifest.json'),'utf8'));
export const lesson03AssetAudit=preserved.files.map(file=>{
  const image=lesson02Images.find(item=>item.key===file.key);
  assert(image,`Preserved image missing: ${file.key}`);
  assert(path.relative(repositoryRoot,image.source).split(path.sep)[0]!=='..','Repository-local source required');
  const bytes=readFileSync(image.source),sha256=createHash('sha256').update(bytes).digest('hex');
  assert.equal(sha256,file.sha256,`Preserved original changed: ${file.key}`);
  return {key:file.key,source:path.relative(repositoryRoot,image.source).replaceAll('\\','/'),outputPath:image.outputPath,sha256,bytes:bytes.length,studentVisible:!['base','material'].includes(file.key)};
});
assert.equal(lesson03AssetAudit.length,42);
const spaceNames=['소형 오피스 리셉션·대기공간','소형 회의실','상담 라운지','업무·휴게 라운지','소형 대기공간'];
export const lesson03Spaces=lesson02BeforeImages.map((image,index)=>({...image,title:spaceNames[index]}));
export const lesson03Materials=lesson02MaterialImages;
export const lesson03Defaults=lesson02DefaultMaterialIds.map(id=>lesson03Materials.find(m=>m.id===id));
export const lesson03Temperature=lesson02Images.find(image=>image.key==='lighting');
export const lesson03AppliedExample=lesson02Images.find(image=>image.key==='base');
export const lesson03Lighting=lesson02Images.find(image=>image.key==='lighting-reference');
assert.equal(lesson03Spaces.length,5);assert.equal(lesson03Materials.length,33);assert.equal(lesson03Defaults.length,8);

const sampleRoot=path.join(repositoryRoot,'review/daejeon/DJ-L03-CONTINUOUS-SAMPLE');
const sampleManifest=JSON.parse(readFileSync(path.join(sampleRoot,'instructor/manifest.json'),'utf8'));
const revision=JSON.parse(readFileSync(path.join(sampleRoot,'instructor/revision-v3/manifest.json'),'utf8'));
const sampleDefinitions=[
  ['reference','inputs/DJ-L03_01_reference-space.png','디자인 적용 전 기준 공간'],
  ['edited','outputs/DJ-L03_02_edited-space.png','재질을 적용한 수정 공간'],
  ['board','outputs/DJ-L03_04_design-board.png','디자인 방향 보드'],
  ['edited-board','outputs/DJ-L03_05_edited-board-v3.png','대표 공간·카드·팔레트를 함께 갱신한 디자인 방향 보드'],
  ['concept','outputs/DJ-L03_06_new-concept-v3.png','새로운 공간 콘셉트'],
  ['walnut','inputs/DJ-L03_M21_dark-walnut.png','Dark Walnut Reference'],
  ['oak','inputs/DJ-L03_M24_natural-oak.png','Natural Oak Reference'],
];
export const lesson03SampleImages=sampleDefinitions.map(([key,relative,title])=>{
  const source=path.join(sampleRoot,relative),bytes=readFileSync(source),sha256=createHash('sha256').update(bytes).digest('hex');
  const original=revision.files.find(item=>item.file===relative)||sampleManifest.display.find(item=>item.file===relative)||sampleManifest.originalCopies.find(item=>item.copy===relative);
  assert(original&&original.sha256===sha256,'Continuous sample original changed: '+relative);
  assert(bytes.subarray(1,4).toString()==='PNG');
  return {key:'sample-'+key,source,file:path.basename(relative),title,outputPath:'practice/DJ-L03/'+path.basename(relative),sha256,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
});
export const lesson03Sample=Object.fromEntries(lesson03SampleImages.map(image=>[image.key.replace('sample-',''),image]));
const promptDefinitions=[
  ['space-edit','DJ-L03_01_space-edit-prompt.txt','실습 예제 · 공간 일부 수정','공간-일부-수정-Prompt.txt'],
  ['meta','DJ-L03_02_board-meta-prompt.txt','Meta Prompt · 보드용 요청문 만들기','디자인보드-Meta-Prompt.txt'],
  ['board','DJ-L03_03_board-generation-prompt.txt','디자인 방향 보드 Prompt','디자인보드-생성-Prompt.txt'],
  ['board-edit','DJ-L03_04_board-edit-warm-concept-v3-prompt.txt','디자인보드 전체 방향 갱신 Prompt','디자인보드-따뜻한방향-Prompt.txt'],
  ['concept','DJ-L03_05_new-warm-concept-v3-prompt.txt','실습 예제 · 새로운 공간 콘셉트','새로운-공간-콘셉트-Prompt.txt'],
];
const sumsPath=path.join(sampleRoot,'instructor/SHA256SUMS.txt');
const approvedSums=existsSync(sumsPath)?new Map(readFileSync(sumsPath,'utf8').trim().split(/\r?\n/).map(line=>[line.slice(66),line.slice(0,64)])):new Map();
export const lesson03SamplePrompts=promptDefinitions.map(([key,file,title,downloadName])=>{
  const source=path.join(sampleRoot,'prompts',file),bytes=readFileSync(source),digest=createHash('sha256').update(bytes).digest('hex');
  const newFile=revision.files.find(item=>item.file==='prompts/'+file);
  const call=revision.calls.find(item=>item.actualPrompt.trimEnd()===bytes.toString('utf8').trimEnd())||sampleManifest.calls.find(item=>item.promptFile==='prompts/'+file);
  assert.equal(digest,newFile?.sha256||approvedSums.get('prompts/'+file)||digest,'Approved sample prompt changed: '+file);
  if(key!=='meta')assert(call&&bytes.toString('utf8').trimEnd()===call.actualPrompt.trimEnd(),'Actual image prompt mismatch: '+file);
  assert(!/\b(?:S0|S1|B1|B2|S2)\b|DJ-L03|\bx\s*=|\by\s*=|preservation correction/i.test(bytes.toString('utf8')),'Internal details in student prompt');
  return {key,source,file,title,downloadName,text:bytes.toString('utf8').trim(),outputPath:'practice/DJ-L03/'+file,sha256:createHash('sha256').update(bytes).digest('hex')};
});
export const lesson03SamplePrompt=Object.fromEntries(lesson03SamplePrompts.map(prompt=>[prompt.key,prompt]));
export const lesson03SampleAnalysis=ebookText(readFileSync(path.join(sampleRoot,'analysis/DJ-L03_03_design-analysis.txt'),'utf8').trim());

export const lesson03WarmAnalysis={key:'warm-analysis',source:path.join(sampleRoot,'analysis/DJ-L03_A02_warm-concept-analysis-v3.md'),outputPath:'practice/DJ-L03/DJ-L03_A02_warm-concept-analysis-v3.md'};
export const lesson03WarmAnalysisText=ebookText(readFileSync(lesson03WarmAnalysis.source,'utf8'));
