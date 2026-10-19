import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {repositoryRoot} from './course-registry.mjs';
import {ebookText} from './daejeon-ebook-language.mjs';
/** @typedef {{key:string,file:string,title:string,description:string,source:string,originalSource:string,outputPath:string,sha256:string,width:number,height:number,text:string,section?:string,doorState?:string,attachments?:{file:string,role:string,outputPath:string}[]}} Lesson06Asset */
const root=path.join(repositoryRoot,'review/daejeon/DJ-L06-3D-ZONING/revision-review8-20261016');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
assert.equal(manifest.sectionCount,12);assert.equal(manifest.durationMinutes,150);
const read=item=>{const source=path.join(root,item.file),bytes=fs.readFileSync(source),sha256=createHash('sha256').update(bytes).digest('hex');const expected=manifest.files.find(row=>row.file===item.file);if(expected)assert.equal(sha256,expected.sha256,'Lesson06 asset changed: '+item.file);return{key:item.key||item.file.replace(/[^a-z0-9-]/gi,'-'),title:item.title||item.file,description:item.description||'',originalSource:item.originalSource||expected?.originalSource||'',width:item.width||0,height:item.height||0,text:/\.(txt|md|json)$/.test(item.file)?bytes.toString('utf8').trim():null,...item,source,outputPath:'practice/DJ-L06/'+item.file,sha256};};
/** @type {Lesson06Asset[]} */
export const lesson06Legacy=manifest.legacy.map(read);
/** @type {Lesson06Asset[]} */
export const lesson06Inputs=manifest.inputs.map(read);
/** @type {Lesson06Asset[]} */
export const lesson06Images=manifest.images.map(read);
/** @type {Lesson06Asset[]} */
export const lesson06Prompts=manifest.prompts.map(read);
export const lesson06Image=Object.fromEntries([...lesson06Legacy,...lesson06Inputs,...lesson06Images].map(item=>[item.key,item]));
export const lesson06Prompt=Object.fromEntries(lesson06Prompts.map(item=>[item.key,item]));
/** @type {Lesson06Asset[]} */
export const lesson06Downloads=manifest.downloads.map(read);
export const lesson06Zip=read({key:'zip',file:'DJ-L06-3d-isometric-zoning.zip',title:'제6차시 통합 실습자료'});
/** @type {Lesson06Asset[]} */
export const lesson06Assets=[...manifest.files.map(read),...['manifest.json','SHA256SUMS.txt'].map(file=>read({file})),lesson06Zip];
assert.equal(lesson06Legacy.length,9);assert.equal(lesson06Images.length,8);assert.equal(lesson06Prompts.length,8);
assert(lesson06Legacy.every(item=>/^legacy-(?:basic|house)\//.test(item.file)),'Unexpected Lesson06 legacy source');
assert.equal(new Set(lesson06Prompts.map(item=>item.key)).size,lesson06Images.length,'Duplicate Lesson06 Prompt key');
for(const image of lesson06Images){assert(lesson06Prompt[image.key],'Missing Lesson06 Prompt: '+image.key);}
for(const prompt of lesson06Prompts){assert.equal(prompt.file,'prompts/'+prompt.key+'.txt','One Prompt TXT per stage');assert.equal(ebookText(prompt.text),prompt.text,'Prompt display transformation: '+prompt.key);assert(!/해상도|픽셀|\b\d+\s*(?:px|pixels?)\b|화면\s*비율/i.test(prompt.text),'Raster sizing notation in displayed Prompt '+prompt.key);}

/** Reject English sentence runs while retaining filenames, view names and diagram labels. */
export function assertKoreanPromptText(text,label='Prompt'){
 const clean=text.replace(/[A-Za-z0-9_./-]+\.(?:png|jpe?g|txt|md)/gi,'').replace(/Top View 3D|WORK ZONE|PANTRY\s*\/\s*SUPPORT/g,'');
 assert(!/\b[A-Za-z]{2,}(?:[ \t]+[A-Za-z]{2,}){3,}\b/.test(clean),'English sentence in '+label);
}
for(const prompt of lesson06Prompts)assertKoreanPromptText(prompt.text,prompt.file);
