import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {repositoryRoot} from './course-registry.mjs';
import {ebookText} from './daejeon-ebook-language.mjs';

/** @typedef {{key:string,file:string,title:string,description:string,source:string,originalSource:string,outputPath:string,sha256:string,width:number,height:number,text:string,attachments?:{file:string,role:string,outputPath:string}[]}} PlanAsset */
/** @typedef {{id:string,title:string,description:string,target:string,base:PlanAsset,marked:PlanAsset,result:PlanAsset,overlay:PlanAsset}} PlanSet */
const root=path.join(repositoryRoot,'review/daejeon/DJ-L05-FLOORPLAN-INPAINTING/revision-review8-20261016');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
const legacyDescriptions={
 'legacy-A/01-original-first-floor-plan.png':'식탁 6석의 위치와 주변 벽·개구부·가구를 읽는 주택 원본 평면입니다.',
 'legacy-A/02-edit-area-marked-plan.png':'식탁과 의자를 바꿀 영역을 표시하고 주변 선·문자·다른 가구를 유지 대상으로 구분합니다.',
 'legacy-A/03-modified-first-floor-plan.png':'식탁을 8석으로 바꾼 결과입니다. 긴 변 3+3석과 양 끝 1석씩을 세고 주변 도면을 대조합니다.',
};
const read=item=>{
 const source=path.join(root,item.file);
 const bytes=fs.readFileSync(source);
 const sha256=createHash('sha256').update(bytes).digest('hex');
 const expected=manifest.files.find(file=>file.file===item.file);
 if(expected)assert.equal(sha256,expected.sha256,item.file);
 return {...item,key:item.key||item.file,title:ebookText(item.title||item.file),description:legacyDescriptions[item.file]||ebookText(item.description||''),originalSource:item.originalSource||'',source,outputPath:'practice/DJ-L05/'+item.file,sha256,...(item.file.endsWith('.png')?{width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)}:/\.(txt|md|json)$/.test(item.file)?{text:bytes.toString('utf8').trim()}:{} )};
};
/** @type {PlanSet[]} */
export const lesson05Plans=manifest.plans.map(plan=>({...plan,base:read(plan.base),marked:read(plan.marked),result:read(plan.result),overlay:read(plan.overlay)}));
/** @type {PlanAsset[]} */
export const lesson05Legacy=manifest.legacyImages.map(read);
/** @type {PlanAsset[]} */
export const lesson05Door=manifest.door.map(read);
/** @type {PlanAsset[]} */
export const lesson05RawOutputs=manifest.rawOutputs.map(read);
/** @type {PlanAsset[]} */
export const lesson05Crops=manifest.crops.map(read);
/** @type {PlanAsset[]} */
export const lesson05Prompts=manifest.prompts.map(read);
export const lesson05Prompt=Object.fromEntries(lesson05Prompts.map(prompt=>[prompt.key,prompt]));
/** @type {PlanAsset[]} */
export const lesson05Analysis=manifest.analysis.map(read);
export const lesson05Zip=read({key:'zip',file:'DJ-L05_PRACTICE_REVIEW.zip',title:'제5차시 통합 실습자료'});
/** @type {PlanAsset[]} */
export const lesson05Assets=[...manifest.files.map(read),...['manifest.json','SHA256SUMS.txt'].map(file=>read({file})),lesson05Zip];

/** Reject English sentence runs while retaining filenames, view names and diagram labels. */
export function assertKoreanPromptText(text,label='Prompt'){
 const clean=text.replace(/[A-Za-z0-9_./-]+\.(?:png|jpe?g|txt|md)/gi,'').replace(/Top View 3D|WORK ZONE|PANTRY\s*\/\s*SUPPORT/g,'');
 assert(!/\b[A-Za-z]{2,}(?:[ \t]+[A-Za-z]{2,}){3,}\b/.test(clean),'English sentence in '+label);
}
for(const prompt of lesson05Prompts)assertKoreanPromptText(prompt.text,prompt.file);
