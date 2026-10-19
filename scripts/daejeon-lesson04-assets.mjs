import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {repositoryRoot} from './course-registry.mjs';
import {ebookText} from './daejeon-ebook-language.mjs';
/** @typedef {{key:string,id:string,file:string,title:string,description:string,outputPath:string,source:string,originalSource:string,sha256:string,width:number,height:number,type:string,keep:string,change:string,text:string,attachments?:{file:string,role:string,outputPath:string}[]}} Lesson04Asset */
const root=path.join(repositoryRoot,'review/daejeon/DJ-L04-EXTERIOR-PLAN/implementation-13');
const manifest=JSON.parse(readFileSync(path.join(root,'manifest.json'),'utf8'));
assert.equal(manifest.sectionCount,13);
const asset=item=>{
  const source=path.join(root,item.file),bytes=readFileSync(source),sha256=createHash('sha256').update(bytes).digest('hex');
  const expected=manifest.files.find(f=>f.file===item.file);
  if(expected)assert.equal(sha256,expected.sha256,'Lesson04 asset changed: '+item.file);
  return {...item,title:ebookText(item.title||''),description:ebookText(item.description||''),type:ebookText(item.type||''),originalSource:item.source||expected?.source||item.file,source,sha256,outputPath:'practice/DJ-L04/'+item.file,...(item.file.endsWith('.png')?{width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)}:(/\.(?:txt|md|json)$/.test(item.file)?{text:bytes.toString('utf8').trim()}:{}))};
};
/** @type {Lesson04Asset[]} */
export const lesson04Bases=manifest.bases.map(asset);
/** @type {Lesson04Asset[]} */
export const lesson04References=manifest.refs.map(r=>asset({...r,key:r.id}));
/** @type {Lesson04Asset[]} */
export const lesson04Samples=manifest.samples.map(asset);
/** @type {Lesson04Asset[]} */
export const lesson04Prompts=manifest.prompts.map(asset);
export const lesson04Prompt=Object.fromEntries(lesson04Prompts.map(p=>[p.key,p]));
/** @type {Lesson04Asset[]} */
export const lesson04Analysis=manifest.analysis.map(asset);
/** @type {Lesson04Asset[]} */
export const lesson04Downloads=['README.txt','manifest.json','SHA256SUMS.txt'].map(file=>asset({key:file,file,title:file}));
export const lesson04Assets=[...lesson04Bases,...lesson04References,...lesson04Samples,...lesson04Prompts,...lesson04Analysis,...lesson04Downloads,...manifest.executionInputs.map(asset)];
assert.equal(lesson04Bases.length,3);assert.equal(lesson04References.length,5);assert.equal(lesson04Prompts.length,16);assert.equal(lesson04Analysis.length,2);
for(const p of lesson04Prompts)assert(!/해상도|픽셀|\b\d+\s*[x×:]\s*\d+\b|화면\s*비율/.test(p.text),'Display sizing notation in learner Prompt: '+p.file);
